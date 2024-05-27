import { ProcessedVideo } from '@prisma/client';

export class SetVideoIsPublishedEvent {
  videoId: string;
  videos: Array<ProcessedVideo>;

  constructor(videoId: string, videos: Array<ProcessedVideo>) {
    this.videoId = videoId;
    this.videos = videos;
  }
}
