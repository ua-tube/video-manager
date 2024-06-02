import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { UpdateVideoVotesMetricsDto } from './dto';

@Injectable()
export class LibraryService {
  private readonly logger = new Logger(LibraryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async updateVideoVotesMetrics(payload: UpdateVideoVotesMetricsDto) {
    const video = await this.prisma.video.findUnique({
      where: { id: payload.videoId },
      select: { 
        status: true,
        metrics: {
          select: { votesCountUpdatedAt: true }
        }
       },
    });

    if (!video || video.status === 'Unregistered') {
      this.logger.warn(`Video (${payload.videoId}) does not exists or unregistered`);
      return;
    }

    if (payload.updatedAt <= video.metrics.votesCountUpdatedAt) {
      this.logger.warn('Video metrics update is too old, skip...');
      return;
    }

    await this.prisma.videoMetrics.update({
      where: { videoId: payload.videoId },
      data: {
        likesCount: BigInt(payload.likesCount),
        dislikesCount: BigInt(payload.dislikesCount),
        votesCountUpdatedAt: payload.updatedAt,
      },
    });

    this.logger.log(`Votes metric updated for video (${payload.videoId})`);
  }
}
