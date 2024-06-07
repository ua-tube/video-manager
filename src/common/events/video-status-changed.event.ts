import { VideoProcessingStatus } from '@prisma/client';

export class VideoStatusChangedEvent {
  videoId: string;
  status: VideoProcessingStatus;

  constructor(videoId: string, status: VideoProcessingStatus) {
    this.videoId = videoId;
    this.status = status;
  }
}
