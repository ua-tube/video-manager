import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { UpdateVideoViewsMetricsDto } from './dto';

@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async updateVideoViewsMetrics(payload: UpdateVideoViewsMetricsDto) {
    this.logger.log('Video metrics update is called');

    const video = await this.prisma.video.findUnique({
      where: { id: payload.videoId },
      select: { 
        status: true,
        metrics: {
          select: { viewsCountUpdatedAt: true }
        }
       },
    });

    if (!video || video.status === 'Unregistered') {
      this.logger.warn(
        `Video (${payload.videoId}) does not exists or unregistered`,
      );
      return;
    }

    if (payload.updatedAt <= video.metrics.viewsCountUpdatedAt) {
      this.logger.warn('Video metrics update is too old, skip...');
      return;
    }

    await this.prisma.videoMetrics.update({
      where: { videoId: payload.videoId },
      data: {
        viewsCount: BigInt(payload.viewsCount),
        viewsCountUpdatedAt: payload.updatedAt,
      },
    });

    this.logger.log(`Views metric updated for video (${payload.videoId})`);
  }
}
