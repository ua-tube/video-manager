import { VideoThumbnail } from '@prisma/client';

export class ThumbnailProcessedEvent {
  userId: string;
  videoId: string;
  thumbnails: VideoThumbnail[];

  constructor(userId: string, videoId: string, thumbnails: VideoThumbnail[]) {
    this.userId = userId;
    this.videoId = videoId;
    this.thumbnails = thumbnails;
  }
}
