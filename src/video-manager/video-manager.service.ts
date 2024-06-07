import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateVideoDto, PaginationDto, SortDto, UpdateVideoDto } from './dto';
import { PrismaService } from '../prisma';
import { JwtService } from '@nestjs/jwt';
import {
  COMMUNITY_SVC,
  HISTORY_SVC,
  LIBRARY_SVC,
  SEARCH_SVC,
  VIDEO_PROCESSOR_SVC,
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
  SearchUpdateVideoEvent,
  SetVideoIsPublishedEvent,
  SyncVideoEvent,
  VideoStoreCreateVideoEvent,
  VideoStoreUpdateVideoEvent,
} from '../common/events';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { VideoMetrics } from '@prisma/client';
import { paginate } from './utils';
import { fromEvent, map } from 'rxjs';

@Injectable()
export class VideoManagerService implements OnModuleInit {
  private readonly logger = new Logger(VideoManagerService.name);
  private readonly clients: { name: string; client: ClientRMQ }[] = [
    { name: VIDEO_PROCESSOR_SVC, client: this.videoProcessorClient },
    { name: VIDEO_STORE_SVC, client: this.videoStoreClient },
    { name: COMMUNITY_SVC, client: this.communityClient },
    { name: LIBRARY_SVC, client: this.libraryClient },
    { name: HISTORY_SVC, client: this.historyClient },
    { name: SEARCH_SVC, client: this.searchClient },
  ];

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(VIDEO_PROCESSOR_SVC)
    private readonly videoProcessorClient: ClientRMQ,
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

  async onModuleInit(): Promise<void> {
    this.clients.forEach(({ client, name }) => {
      client
        .connect()
        .then(() => this.logger.log(`${name} connection established`))
        .catch(() => this.logger.error(`${name} connection failed`));
    });
  }

  async createVideo(creatorId: string, dto: CreateVideoDto) {
    const creator = await this.prisma.creator.findUnique({
      where: { id: creatorId },
      select: { id: true },
    });

    if (!creator) throw new BadRequestException('Creator does not exists');

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

    const pattern = 'create_video';
    this.videoStoreClient.emit(pattern, new VideoStoreCreateVideoEvent(video));
    this.libraryClient.emit(pattern, new LibraryCreateVideoEvent(video));
    this.historyClient.emit(pattern, new HistoryCreateVideoEvent(video));
    this.searchClient.emit(
      pattern,
      new SearchCreateVideoEvent({
        ...video,
        tags: video?.tags?.split(',') || [],
      }),
    );
    this.communityClient.emit(
      'create_forum',
      new CreateForumEvent(video.id, creatorId),
    );

    return video;
  }

  async getVideoById(id: string) {
    const video = await this.prisma.video.findUnique({
      where: { id, status: { not: 'Unregistered' } },
      include: {
        thumbnails: true,
        metrics: true,
      },
    });

    if (!video) {
      throw new NotFoundException(`Video ${id} not found`);
    }

    return {
      ...video,
      metrics: this.serializeMetrics(video?.metrics),
    };
  }

  async getVideos(creatorId: string, pagination: PaginationDto, sort: SortDto) {
    const [videos, count] = await this.prisma.$transaction([
      this.prisma.video.findMany({
        where: { creatorId, status: { not: 'Unregistered' } },
        include: {
          thumbnails: true,
          metrics: true,
        },
        take: pagination.perPage,
        skip: (pagination.page - 1) * pagination.perPage,
        orderBy: { [sort.sortBy]: sort.sortOrder },
      }),
      this.prisma.video.count({
        where: { creatorId, status: { not: 'Unregistered' } },
      }),
    ]);

    return paginate({
      data: videos.map((v) => ({
        ...v,
        metrics: this.serializeMetrics(v?.metrics),
      })),
      count,
      ...pagination,
    });
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
      const updatedVideo = await this.prisma.video.update({
        where: { id: videoId },
        data: dto,
        include: { thumbnails: true },
      });

      await this.syncVideo(
        new SyncVideoEvent(
          updatedVideo,
          updatedVideo.thumbnails.find(
            (x) => x.imageFileId === updatedVideo.thumbnailId,
          ).url,
        ),
      );
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

    try {
      await this.prisma.video.update({
        where: { id: videoId },
        data: { status: 'Unregistered' },
      });

      const pattern = 'unregister_video';
      const data = { videoId };

      if (video.processingStatus === 'VideoBeingProcessed') {
        this.videoProcessorClient.emit('process_video_cancel', data);
      }

      this.communityClient.emit('unregister_forum', data);
      this.videoStoreClient.emit(pattern, data);
      this.libraryClient.emit(pattern, data);
      this.historyClient.emit(pattern, data);
      this.searchClient.emit(pattern, data);

      this.logger.log(`Video ${videoId} is unregistered`);

      return { status: true };
    } catch (e) {
      this.logger.error(e);
      return { status: false };
    }
  }

  sse(userId: string) {
    return fromEvent(this.eventEmitter, `processor.${userId}`).pipe(
      map((data) => JSON.stringify(data)),
    );
  }

  private serializeMetrics(metrics?: VideoMetrics) {
    return metrics
      ? {
          ...metrics,
          viewsCount: metrics.viewsCount.toString(),
          likesCount: metrics.likesCount.toString(),
          dislikesCount: metrics.dislikesCount.toString(),
          commentsCount: metrics.commentsCount.toString(),
        }
      : {};
  }

  @OnEvent('sync_video')
  private async syncVideo(data: SyncVideoEvent) {
    const pattern = 'update_video';
    this.videoStoreClient.emit(pattern, new VideoStoreUpdateVideoEvent(data));
    this.libraryClient.emit(pattern, new LibraryUpdateVideoEvent(data));
    this.historyClient.emit(pattern, new HistoryUpdateVideoEvent(data));
    this.searchClient.emit(
      pattern,
      new SearchUpdateVideoEvent({
        ...data,
        tags: data?.tags?.split(',') || [],
      }),
    );
  }

  @OnEvent('set_video_is_published')
  private async setVideoIsPublished(data: SetVideoIsPublishedEvent) {
    this.videoStoreClient.emit('set_video_is_published', data);
  }
}
