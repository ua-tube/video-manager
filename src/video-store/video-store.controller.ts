import { Controller } from '@nestjs/common';
import { VideoStoreService } from './video-store.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { ackMessage } from '../common/utils';
import { VideoPublishedDto, VideoUnpublishedDto } from './dto';

@Controller()
export class VideoStoreController {
  constructor(private readonly videoStoreService: VideoStoreService) {}

  @EventPattern('video_published')
  async handleVideoPublished(
    @Payload() payload: VideoPublishedDto,
    @Ctx() context: RmqContext,
  ) {
    await this.videoStoreService.setVideoPublished(payload);
    ackMessage(context);
  }

  @EventPattern('video_unpublished')
  async handleVideoUnpublished(
    @Payload() payload: VideoUnpublishedDto,
    @Ctx() context: RmqContext,
  ) {
    await this.videoStoreService.setVideoUnpublished(payload);
    ackMessage(context);
  }
}
