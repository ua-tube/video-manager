import { Controller } from '@nestjs/common';
import { VideoProcessorService } from './video-processor.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { AddPreview, AddProcessedVideo, AddThumbnails, SetStatus } from './types';

@Controller()
export class VideoProcessorController {
  constructor(private readonly videoProcessorService: VideoProcessorService) {}

  @MessagePattern('set_processing_status')
  async handleSetStatus(@Payload() payload: SetStatus) {
    return this.videoProcessorService.setProcessingStatus(payload);
  }

  @EventPattern('add_processed_video')
  async handleAddProcessedVideo(@Payload() payload: AddProcessedVideo) {
    await this.videoProcessorService.addProcessedVideo(payload);
  }

  @EventPattern('add_preview')
  async handleAddPreview(@Payload() payload: AddPreview) {
    await this.videoProcessorService.addPreview(payload);
  }

  @EventPattern('add_thumbnails')
  async handleAddThumbnails(@Payload() payload: AddThumbnails) {
    await this.videoProcessorService.addThumbnails(payload);
  }

  @EventPattern('publish_video')
  async handlePublishVideo(@Payload() payload: { videoId: string }) {
    await this.videoProcessorService.publishVideo(payload.videoId);
  }
}
