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
      select: { status: true },
    });

    if (!video || video.status === 'Unregistered')
      throw new BadRequestException();

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
