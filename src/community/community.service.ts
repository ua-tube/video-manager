import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { UpdateVideoCommentsMetricsDto } from './dto';

@Injectable()
export class CommunityService {
  private readonly logger = new Logger(CommunityService.name);

  constructor(private readonly prisma: PrismaService) {}

  async updateVideoCommentsMetrics(payload: UpdateVideoCommentsMetricsDto) {
    const video = await this.prisma.video.findUnique({
      where: { id: payload.videoId },
      select: {
        status: true,
        metrics: {
          select: { commentsCountUpdatedAt: true },
        },
      },
    });

    if (!video || video.status === 'Unregistered') {
      this.logger.warn(
        `Video (${payload.videoId}) does not exists or unregistered`,
      );
      return;
    }

    if (payload.updatedAt <= video.metrics.commentsCountUpdatedAt) {
      this.logger.warn('Video metrics update is too old, skip...');
      return;
    }

    await this.prisma.videoMetrics.update({
      where: { videoId: payload.videoId },
      data: {
        commentsCount: BigInt(payload.commentsCount),
        commentsCountUpdatedAt: payload.updatedAt,
      },
    });

    this.logger.log(`Comments metric updated for video (${payload.videoId})`);
  }
}
