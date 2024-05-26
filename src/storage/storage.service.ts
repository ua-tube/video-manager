import { Injectable, Logger } from '@nestjs/common';
import { VideoUploadedDto } from './dto';
import { PrismaService } from '../prisma';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly prisma: PrismaService) {}

  async setVideoUploaded(payload: VideoUploadedDto) {
    const video = await this.prisma.video.findUnique({
      where: { id: payload.videoId },
      select: { status: true, processingStatus: true },
    });

    if (!video || video.status === 'Unregistered') {
      this.logger.warn(
        `Video (${payload.videoId}) doest not exists or unregistered`,
      );
      return;
    }

    if (video.processingStatus !== 'WaitingForUserUpload') return;

    await this.prisma.video.update({
      where: { id: payload.videoId },
      data: {
        originalVideoFileName: payload.originalFileName,
        originalVideoUrl: payload.url,
        processingStatus: 'VideoUploaded',
      },
    });

    this.logger.log(`Video (${payload.videoId}) is uploaded`);
  }
}
