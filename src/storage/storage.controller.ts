import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { VideoUploadedDto } from './dto';
import { StorageService } from './storage.service';
import { ackMessage } from '../common/utils';

@Controller()
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @EventPattern('video_uploaded')
  async handleVideoUploaded(
    @Payload() payload: VideoUploadedDto,
    @Ctx() context: RmqContext,
  ) {
    await this.storageService.setVideoUploaded(payload);
    ackMessage(context);
  }
}
