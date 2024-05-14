import {
  BadRequestException,
  ForbiddenException, Inject,
  Injectable,
  Logger,
  NotFoundException, OnApplicationBootstrap,
} from '@nestjs/common';
import { CreateVideoDto, PaginationDto, SortDto, UpdateVideoDto } from './dto';
import { PrismaService } from '../prisma';
import { JwtService } from '@nestjs/jwt';
import { COMMUNITY_SVC, LIBRARY_SVC } from '../common/constants';
import { ClientRMQ } from '@nestjs/microservices';
import { CreateForumEvent, UpsertVideoEvent } from '../common/events';
import { OnEvent } from '@nestjs/event-emitter';
import { SyncVideoPayload } from './types';

@Injectable()
export class VideoManagerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(VideoManagerService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    @Inject(LIBRARY_SVC)
    private readonly libraryClient: ClientRMQ,
    @Inject(COMMUNITY_SVC)
    private readonly communityClient: ClientRMQ,
  ) {
  }

  onApplicationBootstrap(): void {
    this.libraryClient
      .connect()
      .then(() =>
        this.logger.log(`${LIBRARY_SVC} connection established`),
      )
      .catch(() => this.logger.error(`${LIBRARY_SVC} connection failed`));
    this.communityClient
      .connect()
      .then(() =>
        this.logger.log(`${COMMUNITY_SVC} connection established`),
      )
      .catch(() => this.logger.error(`${COMMUNITY_SVC} connection failed`));
  }

  async createVideo(creatorId: string, dto: CreateVideoDto) {
    const video = await this.prisma.video.create({
      data: {
        creatorId,
        ...dto,
        isPublished: false,
        processingStatus: 'WaitingForUserUpload',
        visibility: 'Private',
        thumbnailStatus: 'Waiting',
        status: 'Created',
        Metrics: { create: {} },
      },
    });

    this.logger.log(`Video (${video.id}) is created`);
    this.syncVideo(video);
    this.communityClient.emit('create_forum', new CreateForumEvent(video.id, creatorId));

    return video;
  }

  async getVideoById(id: string) {
    const video = await this.prisma.video.findUnique({
      where: { id, status: { not: 'Unregistered' } },
      include: {
        ProcessedVideos: true,
        Thumbnails: true,
      },
    });

    if (!video) {
      throw new NotFoundException(`Video ${id} not found`);
    }

    return video;
  }

  async getVideos(creatorId: string, pagination: PaginationDto, sort: SortDto) {
    return this.prisma.$transaction([
      this.prisma.video.findMany({
        where: { creatorId, status: { not: 'Unregistered' } },
        include: {
          ProcessedVideos: true,
          Thumbnails: true,
        },
        take: pagination.perPage,
        skip: (pagination.page - 1) * pagination.perPage,
        orderBy: { [sort.sortBy]: sort.sortOrder },
      }),
      this.prisma.video.count({ where: { creatorId, status: { not: 'Unregistered' } } }),
    ]);
  }

  async getVideoUploadToken(creatorId: string, videoId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new NotFoundException(`Video ${videoId} not found`);
    }

    if (video.creatorId !== creatorId) {
      throw new ForbiddenException(`Incorrect creator`);
    }

    if (video.processingStatus !== 'WaitingForUserUpload') {
      throw new BadRequestException('Video is already uploaded');
    }

    const videoUploadToken = await this.jwtService.signAsync({
      creatorId,
      category: 'user-uploaded-raw-video',
      videoId,
    });

    return { token: videoUploadToken };
  }

  async updateVideo(videoId: string, creatorId: string, dto: UpdateVideoDto) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      select: { creatorId: true },
    });

    if (!video) throw new BadRequestException('Video not found');

    if (video.creatorId !== creatorId) throw new ForbiddenException('Is not your video');

    try {
      await this.prisma.video.update({
        where: { id: videoId },
        data: dto,
      });
      this.logger.log(`Video ${videoId} info updated`);
      return { status: true };
    } catch (e) {
      this.logger.error(e);
      return { status: false };
    }
  }

  async unregisterVideo(videoId: string, creatorId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      select: { status: true, creatorId: true, processingStatus: true },
    });

    if (!video) throw new BadRequestException('Video not found');

    if (video.creatorId !== creatorId)
      throw new ForbiddenException('Is not your video');

    if (video.status === 'Unregistered') return { status: false };

    if (video.status !== 'RegistrationFailed' &&
      video.processingStatus !== 'WaitingForUserUpload' &&
      video.processingStatus !== 'VideoProcessed') {
      throw new BadRequestException();
    }

    try {
      await this.prisma.video.update({
        where: { id: videoId },
        data: { status: 'Unregistered' },
      });
      this.logger.log(`Video ${videoId} is unregistered`);
      return { status: true };
    } catch (e) {
      this.logger.error(e);
      return { status: false };
    }
  }

  private syncVideo(video: SyncVideoPayload) {
    const event = new UpsertVideoEvent(video);
    this.libraryClient.emit('upsert_video', event);
  }

  @OnEvent('sync_video')
  private async handleSyncVideo(data: SyncVideoPayload) {
    this.syncVideo(data);
  }
}
