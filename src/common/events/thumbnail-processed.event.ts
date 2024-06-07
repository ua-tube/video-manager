import { VideoThumbnail } from '@prisma/client';

export class ThumbnailProcessedEvent {
  videoId: string;
  thumbnails: VideoThumbnail[];

  constructor(videoId: string, thumbnails: VideoThumbnail[]) {
    this.videoId = videoId;
    this.thumbnails = thumbnails;
  }
}
