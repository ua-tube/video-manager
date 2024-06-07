import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import {
  AddPreviewDto,
  AddProcessedVideoDto,
  AddThumbnailsDto,
  SetStatusDto,
} from './dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  SetVideoIsPublishedEvent,
  SyncVideoEvent,
  ThumbnailProcessedEvent,
  VideoStatusChangedEvent,
  VideoStepProcessedEvent,
} from '../common/events';

@Injectable()
export class VideoProcessorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async addProcessedVideo(payload: AddProcessedVideoDto) {
    if (payload?.lengthSeconds) {
      const video = await this.prisma.video.update({
        where: { id: payload.videoId },
        data: { lengthSeconds: payload.lengthSeconds },
      });

      this.eventEmitter.emit('sync_video', new SyncVideoEvent(video));
    }

    const video = await this.prisma.video.findUnique({
      where: { id: payload.videoId },
      select: { creatorId: true },
    });

    this.emitEvent(video.creatorId, {
      event: 'video_step_processed',
      data: new VideoStepProcessedEvent(payload.videoId, payload.label),
    });
  }

  async addPreview(payload: AddPreviewDto) {
    await this.prisma.videoPreviewThumbnail.create({
      data: payload,
    });
  }

  async addThumbnails(payload: AddThumbnailsDto) {
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
        thumbnails: true,
      },
    });

    this.emitEvent(video.creatorId, {
      event: 'thumbnail_processed',
      data: new ThumbnailProcessedEvent(video.id, video.thumbnails),
    });
  }

  async videoProcessFinished(videoId: string) {
    const video = await this.prisma.video.update({
      where: { id: videoId },
      data: {
        status: 'Registered',
        processingStatus: 'VideoProcessed',
      },
      include: {
        thumbnails: { select: { imageFileId: true, url: true } },
        videoPreviewThumbnail: { select: { url: true } },
      },
    });

    this.emitEvent(video.creatorId, {
      event: 'video_status_changed',
      data: new VideoStatusChangedEvent(video.id, video.processingStatus),
    });

    this.eventEmitter.emit(
      'sync_video',
      new SyncVideoEvent(
        video,
        video?.thumbnails?.find(
          (x) => x.imageFileId === video.thumbnailId,
        )?.url,
        video?.videoPreviewThumbnail?.url,
      ),
    );

    this.eventEmitter.emit(
      'set_video_is_published',
      new SetVideoIsPublishedEvent(video.id),
    );
  }

  async setProcessingStatus(payload: SetStatusDto) {
    const video = await this.prisma.video.update({
      where: { id: payload.videoId },
      data: { processingStatus: payload.status },
    });

    this.emitEvent(video.creatorId, {
      event: 'video_status_changed',
      data: new VideoStatusChangedEvent(video.id, video.processingStatus),
    });

    return video;
  }

  private emitEvent(
    userId: string,
    data: {
      event: string;
      data: object;
    },
  ) {
    this.eventEmitter.emit(`processor.${userId}`, data);
  }
}
