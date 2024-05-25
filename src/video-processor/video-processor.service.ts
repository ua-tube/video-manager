import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import {
  AddPreviewDto,
  AddProcessedVideoDto,
  AddThumbnailsDto,
  SetStatusDto,
} from './dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class VideoProcessorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async addProcessedVideo(payload: AddProcessedVideoDto) {
    const video = await this.prisma.processedVideo.create({
      //data: payload,
      data: {
        ...payload,
        size: BigInt(payload.size),
      },
      select: {
        video: {
          select: {
            id: true,
            creatorId: true,
          },
        },
        label: true,
      },
    });

    this.eventEmitter.emit('video_step_processed', {
      userId: video.video.creatorId,
      videoId: video.video.id,
      label: video.label,
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

    this.eventEmitter.emit('thumbnail_processed', {
      userId: video.creatorId,
      videoId: video.id,
      thumbnails: video.thumbnails,
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
      include: {
        thumbnails: { select: { imageFileId: true, url: true } },
        videoPreviewThumbnail: { select: { url: true } },
      },
    });

    this.eventEmitter.emit('video_status_changed', {
      userId: video.creatorId,
      videoId: video.id,
      status: video.status,
    });

    this.eventEmitter.emit('sync_video', {
      ...video,
      thumbnailUrl: video?.thumbnails?.find(
        (x) => x.imageFileId === video.thumbnailId,
      )?.url,
      previewThumbnailUrl: video?.videoPreviewThumbnail?.url,
    });
  }

  async setProcessingStatus(payload: SetStatusDto) {
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
}
