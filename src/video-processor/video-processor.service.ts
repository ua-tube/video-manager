import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { AddPreview, AddProcessedVideo, AddThumbnails, SetStatus } from './types';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class VideoProcessorService {
  constructor(private readonly prisma: PrismaService,
              private readonly eventEmitter: EventEmitter2) {
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

    this.eventEmitter.emit('sync_video', {
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
}
