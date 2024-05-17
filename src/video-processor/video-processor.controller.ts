import { Controller } from '@nestjs/common';
import { VideoProcessorService } from './video-processor.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import {
  AddPreviewDto,
  AddProcessedVideoDto,
  AddThumbnailsDto,
  SetStatusDto,
} from './dto';

@Controller()
export class VideoProcessorController {
  constructor(private readonly videoProcessorService: VideoProcessorService) {}

  @MessagePattern('set_processing_status')
  async handleSetStatus(@Payload() payload: SetStatusDto) {
    return this.videoProcessorService.setProcessingStatus(payload);
  }

  @EventPattern('add_processed_video')
  async handleAddProcessedVideo(@Payload() payload: AddProcessedVideoDto) {
    await this.videoProcessorService.addProcessedVideo(payload);
  }

  @EventPattern('add_preview')
  async handleAddPreview(@Payload() payload: AddPreviewDto) {
    await this.videoProcessorService.addPreview(payload);
  }

  @EventPattern('add_thumbnails')
  async handleAddThumbnails(@Payload() payload: AddThumbnailsDto) {
    await this.videoProcessorService.addThumbnails(payload);
  }

  @EventPattern('publish_video')
  async handlePublishVideo(@Payload() payload: { videoId: string }) {
    await this.videoProcessorService.publishVideo(payload.videoId);
  }
}
