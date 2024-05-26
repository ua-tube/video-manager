import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import {
  CreateVideoDto,
  PaginationDto,
  SortDto,
  SyncVideoDto,
  UpdateVideoDto,
} from './dto';
import { PrismaService } from '../prisma';
import { JwtService } from '@nestjs/jwt';
import {
  COMMUNITY_SVC,
  HISTORY_SVC,
  LIBRARY_SVC,
  SEARCH_SVC,
  VIDEO_STORE_SVC,
} from '../common/constants';
import { ClientRMQ } from '@nestjs/microservices';
import {
  CreateForumEvent,
  HistoryCreateVideoEvent,
  HistoryUpdateVideoEvent,
  LibraryCreateVideoEvent,
  LibraryUpdateVideoEvent,
  SearchCreateVideoEvent,
  VideoStoreCreateVideoEvent,
  VideoStoreUpdateVideoEvent,
} from '../common/events';
import { OnEvent } from '@nestjs/event-emitter';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { Video } from '@prisma/client';

@Injectable()
export class VideoManagerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(VideoManagerService.name);
  private readonly clients: { name: string; client: ClientRMQ }[] = [
    { name: VIDEO_STORE_SVC, client: this.videoStoreClient },
    { name: COMMUNITY_SVC, client: this.communityClient },
    { name: LIBRARY_SVC, client: this.libraryClient },
    { name: HISTORY_SVC, client: this.historyClient },
    { name: SEARCH_SVC, client: this.searchClient },
  ];

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    @Inject(LIBRARY_SVC)
    private readonly libraryClient: ClientRMQ,
    @Inject(COMMUNITY_SVC)
    private readonly communityClient: ClientRMQ,
    @Inject(VIDEO_STORE_SVC)
    private readonly videoStoreClient: ClientRMQ,
    @Inject(HISTORY_SVC)
    private readonly historyClient: ClientRMQ,
    @Inject(SEARCH_SVC)
    private readonly searchClient: ClientRMQ,
  ) {}

  onApplicationBootstrap(): void {
    this.clients.forEach(({ client, name }) => {
      client
        .connect()
        .then(() => this.logger.log(`${name} connection established`))
        .catch(() => this.logger.error(`${name} connection failed`));
    });
  }

  async createVideo(creatorId: string, dto: CreateVideoDto) {
    const video = await this.prisma.video.create({
      data: {
        creatorId,
        ...dto,
        isPublished: false,
        lengthSeconds: 0,
        processingStatus: 'WaitingForUserUpload',
        visibility: 'Private',
        thumbnailStatus: 'Waiting',
        status: 'Created',
        metrics: { create: {} },
      },
    });

    this.logger.log(`Video (${video.id}) is created`);
    this.emitCreateVideo(video, creatorId);

    return video;
  }

  async getVideoById(id: string) {
    const video = await this.prisma.video.findUnique({
      where: { id, status: { not: 'Unregistered' } },
      include: {
        processedVideos: true,
        thumbnails: true,
      },
    });

    if (!video) {
      throw new NotFoundException(`Video ${id} not found`);
    }

    return video;
  }

  async getVideos(creatorId: string, pagination: PaginationDto, sort: SortDto) {
    const [videos, count] = await this.prisma.$transaction([
      this.prisma.video.findMany({
        where: { creatorId, status: { not: 'Unregistered' } },
        include: {
          processedVideos: true,
          thumbnails: true,
        },
        take: pagination.perPage,
        skip: (pagination.page - 1) * pagination.perPage,
        orderBy: { [sort.sortBy]: sort.sortOrder },
      }),
      this.prisma.video.count({
        where: { creatorId, status: { not: 'Unregistered' } },
      }),
    ]);

    return { videos, count };
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

    if (video.creatorId !== creatorId)
      throw new ForbiddenException('Is not your video');

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

    if (video.processingStatus === 'VideoBeingProcessed') {
      await axios.post(
        this.configService.get<string>('VIDEO_PROCESSOR_SVC_URL') + '/cancel',
        { videoId },
        {
          headers: {
            token: this.configService.get('VIDEO_PROCESSOR_SERVICE_TOKEN'),
          },
        },
      );
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

  private emitCreateVideo(video: Video, creatorId: string) {
    const pattern = 'create_video';
    this.videoStoreClient.emit(pattern, new VideoStoreCreateVideoEvent(video));
    this.libraryClient.emit(pattern, new LibraryCreateVideoEvent(video));
    this.historyClient.emit(pattern, new HistoryCreateVideoEvent(video));
    this.searchClient.emit(
      pattern,
      new SearchCreateVideoEvent({
        ...video,
        tags: video?.tags?.split(','),
      }),
    );
    this.communityClient.emit(
      'create_forum',
      new CreateForumEvent(video.id, creatorId),
    );
  }

  @OnEvent('sync_video')
  private async handleSyncVideo(data: SyncVideoDto) {
    const pattern = 'update_video';
    this.videoStoreClient.emit(pattern, new VideoStoreUpdateVideoEvent(data));
    this.libraryClient.emit(pattern, new LibraryUpdateVideoEvent(data));
    this.historyClient.emit(pattern, new HistoryUpdateVideoEvent(data));
    this.searchClient.emit(
      pattern,
      new SearchCreateVideoEvent({
        ...data,
        tags: data?.tags?.split(','),
      }),
    );
  }
}
