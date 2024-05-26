import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { VideoPublishedDto, VideoUnpublishedDto } from './dto';

@Injectable()
export class VideoStoreService {
  private readonly logger = new Logger(VideoStoreService.name);

  constructor(private readonly prisma: PrismaService) {}

  async setVideoPublished(payload: VideoPublishedDto) {
    await this.checkVideo(payload.videoId);

    await this.prisma.video.update({
      where: { id: payload.videoId },
      data: {
        isPublished: true,
        publishedAt: payload.publishedAt,
        unpublishedAt: null,
      },
    });
    this.logger.log(`Video (${payload.videoId}) is published`);
  }

  async setVideoUnpublished(payload: VideoUnpublishedDto) {
    await this.checkVideo(payload.videoId);

    await this.prisma.video.update({
      where: { id: payload.videoId },
      data: {
        isPublished: false,
        publishedAt: null,
        unpublishedAt: payload.unpublishedAt,
      },
    });
    this.logger.log(`Video (${payload.videoId}) is published`);
  }

  private async checkVideo(videoId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      select: { status: true },
    });

    if (!video || video.status === 'Unregistered') {
      this.logger.warn(`Video (${videoId}) not found or unregistered`);
      return;
    }
  }
}
