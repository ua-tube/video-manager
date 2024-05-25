import { Controller } from '@nestjs/common';
import { VideoProcessorService } from './video-processor.service';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import {
  AddPreviewDto,
  AddProcessedVideoDto,
  AddThumbnailsDto,
  SetStatusDto,
} from './dto';
import { ackMessage } from '../common/utils';

@Controller()
export class VideoProcessorController {
  constructor(private readonly videoProcessorService: VideoProcessorService) {}

  @MessagePattern('set_processing_status')
  async handleSetStatus(
    @Payload() payload: SetStatusDto,
    @Ctx() context: RmqContext,
  ) {
    const result =
      await this.videoProcessorService.setProcessingStatus(payload);
    ackMessage(context);
    return result;
  }

  @EventPattern('add_processed_video')
  async handleAddProcessedVideo(
    @Payload() payload: AddProcessedVideoDto,
    @Ctx() context: RmqContext,
  ) {
    await this.videoProcessorService.addProcessedVideo(payload);
    ackMessage(context);
  }

  @EventPattern('add_preview')
  async handleAddPreview(
    @Payload() payload: AddPreviewDto,
    @Ctx() context: RmqContext,
  ) {
    await this.videoProcessorService.addPreview(payload);
    ackMessage(context);
  }

  @EventPattern('add_thumbnails')
  async handleAddThumbnails(
    @Payload() payload: AddThumbnailsDto,
    @Ctx() context: RmqContext,
  ) {
    await this.videoProcessorService.addThumbnails(payload);
    ackMessage(context);
  }

  @EventPattern('publish_video')
  async handlePublishVideo(
    @Payload() payload: { videoId: string },
    @Ctx() context: RmqContext,
  ) {
    await this.videoProcessorService.publishVideo(payload.videoId);
    ackMessage(context);
  }
}
