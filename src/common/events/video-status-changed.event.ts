import { VideoProcessingStatus } from '@prisma/client';

export class VideoStatusChangedEvent {
  userId: string;
  videoId: string;
  status: VideoProcessingStatus;

  constructor(userId: string, videoId: string, status: VideoProcessingStatus) {
    this.userId = userId;
    this.videoId = videoId;
    this.status = status;
  }
}
