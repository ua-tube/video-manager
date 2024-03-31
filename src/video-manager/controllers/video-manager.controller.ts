import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { VideoManagerService } from '../video-manager.service';
import { UserId } from '../../common/decorators';
import { CreateVideoDto } from '../dto';
import { AuthUserGuard } from '../../common/guards';

@Controller('video-manager')
export class VideoManagerController {
  constructor(private readonly videoManagerService: VideoManagerService) {
  }

  @UseGuards(AuthUserGuard)
  @Post('videos')
  createVideo(@Body() dto: CreateVideoDto, @UserId() userId: string) {
    return this.videoManagerService.createVideo(userId, dto);
  }

  @Get('videos/:id')
  getVideoById(@Param('id') id: string) {
    return this.videoManagerService.getVideoById(id);
  }

  @Get('videos')
  getVideos() {
    return this.videoManagerService.getVideos();
  }

  @UseGuards(AuthUserGuard)
  @Get('videos/:videoId/upload-token')
  getVideoUploadToken(
    @Param('videoId', ParseUUIDPipe) videoId: string,
    @UserId() userId: string,
  ) {
    return this.videoManagerService.getVideoUploadToken(userId, videoId);
  }

  @Put('videos')
  setVideoInfo() {
  }

  @Delete('videos/:id')
  unregisterVideo() {
  }
}
