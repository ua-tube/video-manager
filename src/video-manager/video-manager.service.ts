import {
  BadRequestException,
  ForbiddenException, Inject,
  Injectable,
  Logger,
  NotFoundException, OnApplicationBootstrap,
} from '@nestjs/common';
import { CreateVideoDto } from './dto';
import { PrismaService } from '../prisma';
import { JwtService } from '@nestjs/jwt';
import {
  AddPreview,
  AddProcessedVideo,
  AddThumbnails,
  SetStatus,
} from './types';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { COMMUNITY_SVC, LIBRARY_SVC } from '../common/constants';
import { ClientRMQ } from '@nestjs/microservices';
import { CreateForumEvent, UpsertVideoEvent } from '../common/events';
import { VideoStatus, VideoVisibility } from '@prisma/client';

@Injectable()
export class VideoManagerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(VideoManagerService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(LIBRARY_SVC)
    private readonly libraryClient: ClientRMQ,
    @Inject(COMMUNITY_SVC)
    private readonly communityClient: ClientRMQ
  ) {}

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
      where: { id },
      include: {
        Metrics: {
          select: {
            viewsCount: true,
            commentsCount: true,
            likesCount: true,
            dislikesCount: true,
          },
        },
        Creator: {
          select: {
            displayName: true,
            nickname: true,
            thumbnailUrl: true,
          },
        },
        ProcessedVideos: {
          select: {
            label: true,
            url: true,
          },
        },
        Thumbnails: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
    });

    if (!video) {
      throw new NotFoundException(`Video ${id} not found`);
    }

    return {
      ...video,
      Metrics: video?.Metrics
        ? {
            viewsCount: `${video.Metrics.viewsCount}`,
            commentsCount: `${video.Metrics.commentsCount}`,
            likesCount: `${video.Metrics.likesCount}`,
            dislikesCount: `${video.Metrics.dislikesCount}`,
          }
        : undefined,
    };
  }

  async getVideos() {
    const videos = await this.prisma.video.findMany({
      where: { isPublished: true, visibility: 'Public' },
      include: {
        Metrics: {
          select: {
            viewsCount: true,
          },
        },
        Creator: {
          select: {
            displayName: true,
            nickname: true,
            thumbnailUrl: true,
          },
        },
        Thumbnails: {
          select: {
            url: true,
          },
          take: 1,
        },
        VideoPreviewThumbnail: {
          select: {
            url: true,
          },
        },
      },
    });

    videos.forEach((v) => {
      v.Metrics = v?.Metrics
        ? ({ viewsCount: `${v.Metrics.viewsCount}` } as any)
        : undefined;
    });

    return videos;
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

  async addProcessedVideo(payload: AddProcessedVideo) {
    const video = await this.prisma.processedVideo.create({
      data: payload,
      select: {
        Video: {
          select: {
            id: true,
            creatorId: true,
          },
        },
        label: true,
      },
    });

    this.eventEmitter.emit('video_step_processed', {
      userId: video.Video.creatorId,
      videoId: video.Video.id,
      label: video.label,
    });
  }

  async addPreview(payload: AddPreview) {
    await this.prisma.videoPreviewThumbnail.create({
      data: payload,
    });
  }

  async addThumbnails(payload: AddThumbnails) {
    if (payload.thumbnails.length < 3) throw new BadRequestException();

    await this.prisma.$transaction(async (tx) => {
      await Promise.allSettled([
        tx.videoThumbnail.createMany({
          data: payload.thumbnails.map((t) => ({
            videoId: payload.videoId,
            url: t.url,
            imageFileId: t.imageFileId,
          })),
        }),
        tx.video.update({
          where: { id: payload.videoId },
          data: { thumbnailStatus: 'Processed' },
        }),
      ]);
    });

    const video = await this.prisma.video.findUnique({
      where: { id: payload.videoId },
      select: {
        id: true,
        creatorId: true,
        Thumbnails: true,
      },
    });

    this.eventEmitter.emit('thumbnail_processed', {
      userId: video.creatorId,
      videoId: video.id,
      thumbnails: video.Thumbnails,
    });
  }

  async publishVideo(videoId: string) {
    const video = await this.prisma.video.update({
      where: { id: videoId },
      data: {
        isPublished: true,
        status: 'Registered',
        processingStatus: 'VideoProcessed',
      },
      select: {
        id: true,
        creatorId: true,
        title: true,
        thumbnailId: true,
        Thumbnails: { select: { imageFileId: true, url: true } },
        VideoPreviewThumbnail: { select: { url: true } },
        visibility: true,
        status: true,
        createdAt: true
      },
    });

    this.eventEmitter.emit('video_status_changed', {
      userId: video.creatorId,
      videoId: video.id,
      status: video.status,
    });
    this.syncVideo({
      ...video,
      thumbnailUrl: video?.Thumbnails?.find(x => x.imageFileId === video.thumbnailId)?.url,
      previewThumbnailUrl: video?.VideoPreviewThumbnail?.url,
    });
  }

  async setProcessingStatus(payload: SetStatus) {
    const video = await this.prisma.video.update({
      where: { id: payload.videoId },
      data: { processingStatus: payload.status },
    });

    this.eventEmitter.emit('video_status_changed', {
      userId: video.creatorId,
      videoId: video.id,
      status: video.processingStatus,
    });

    return video;
  }

  private syncVideo(video: {
    id: string
    creatorId: string
    title: string
    thumbnailUrl?: string
    previewThumbnailUrl?: string
    visibility: VideoVisibility
    status: VideoStatus
    createdAt: Date
  }) {
    const event = new UpsertVideoEvent(video);
    this.libraryClient.emit('upsert_video', event)
  }
}
