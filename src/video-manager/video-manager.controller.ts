import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { VideoManagerService } from './video-manager.service';
import { UserId } from '../common/decorators';
import { CreateVideoDto, PaginationDto, SortDto, UpdateVideoDto } from './dto';
import { AuthUserGuard, AuthUserSseGuard } from '../common/guards';

@Controller('video-manager')
export class VideoManagerController {
  constructor(private readonly videoManagerService: VideoManagerService) {}

  @UseGuards(AuthUserGuard)
  @Post('videos')
  createVideo(@Body() dto: CreateVideoDto, @UserId() userId: string) {
    return this.videoManagerService.createVideo(userId, dto);
  }

  @UseGuards(AuthUserGuard)
  @Get('videos/:id')
  getVideoById(@Param('id') id: string) {
    return this.videoManagerService.getVideoById(id);
  }

  @UseGuards(AuthUserGuard)
  @Get('videos')
  getVideos(
    @UserId() userId: string,
    @Query() query: PaginationDto,
    @Query() sort: SortDto,
  ) {
    return this.videoManagerService.getVideos(userId, query, sort);
  }

  @UseGuards(AuthUserGuard)
  @Get('videos/:videoId/upload-token')
  getVideoUploadToken(
    @Param('videoId', ParseUUIDPipe) videoId: string,
    @UserId() userId: string,
  ) {
    return this.videoManagerService.getVideoUploadToken(userId, videoId);
  }

  @UseGuards(AuthUserGuard)
  @Patch('videos/:videoId')
  updateVideo(
    @Param('videoId', ParseUUIDPipe) videoId: string,
    @Body() body: UpdateVideoDto,
    @UserId() userId: string,
  ) {
    return this.videoManagerService.updateVideo(videoId, userId, body);
  }

  @UseGuards(AuthUserGuard)
  @Delete('videos/:videoId')
  unregisterVideo(
    @Param('videoId', ParseUUIDPipe) videoId: string,
    @UserId() userId: string,
  ) {
    return this.videoManagerService.unregisterVideo(videoId, userId);
  }

  @UseGuards(AuthUserSseGuard)
  @Sse('sse')
  sse(@UserId() userId: string) {
    return this.videoManagerService.sse(userId);
  }
}
