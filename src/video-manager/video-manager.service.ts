import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateVideoDto } from './dto';
import { PrismaService } from '../prisma';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class VideoManagerService {
  private readonly logger = new Logger(VideoManagerService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async createVideo(creatorId: string, dto: CreateVideoDto) {
    const video = await this.prisma.video.create({
      data: {
        creatorId,
        ...dto,
        allowedToPublish: false,
        isPublished: false,
        processingStatus: 'WaitingForUserUpload',
        visibility: 'Private',
        thumbnailStatus: 'Waiting',
        status: 'Created',
        Metrics: { create: {} },
      },
    });

    this.logger.log(`Video (${video.id}) is created`);

    return video;
  }

  async getVideoById(id: string) {
    const video = await this.prisma.video.findUnique({ where: { id } });

    if (!video) {
      throw new NotFoundException(`Video ${id} not found`);
    }

    return video;
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
}
