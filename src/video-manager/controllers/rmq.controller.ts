import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import {
  AddPreview,
  AddProcessedVideo,
  AddThumbnails,
  SetStatus,
} from '../types';
import { VideoManagerService } from '../video-manager.service';

@Controller()
export class RmqController {
  constructor(private readonly videoManagerService: VideoManagerService) {}

  @MessagePattern('set_processing_status')
  async handleSetStatus(@Payload() payload: SetStatus) {
    return this.videoManagerService.setProcessingStatus(payload);
  }

  @EventPattern('add_processed_video')
  async handleAddProcessedVideo(@Payload() payload: AddProcessedVideo) {
    await this.videoManagerService.addProcessedVideo(payload);
  }

  @EventPattern('add_preview')
  async handleAddPreview(@Payload() payload: AddPreview) {
    await this.videoManagerService.addPreview(payload);
  }

  @EventPattern('add_thumbnails')
  async handleAddThumbnails(@Payload() payload: AddThumbnails) {
    await this.videoManagerService.addThumbnails(payload);
  }

  @EventPattern('publish_video')
  async handlePublishVideo(@Payload() payload: { videoId: string }) {
    await this.videoManagerService.publishVideo(payload.videoId);
  }
}
