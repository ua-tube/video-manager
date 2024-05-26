import { ProcessedVideo } from '@prisma/client';

export class UpdateVideoResourcesEvent {
  videoId: string;
  videos: Array<ProcessedVideo>;
  merge: boolean;
  updatedAt: Date;

  constructor(
    videoId: string,
    videos: Array<ProcessedVideo>,
    merge: boolean,
    updatedAt: Date,
  ) {
    this.videoId = videoId;
    this.videos = videos;
    this.merge = merge;
    this.updatedAt = updatedAt;
  }
}
