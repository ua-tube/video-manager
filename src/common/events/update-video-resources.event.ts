import { ProcessedVideo } from '@prisma/client';

export class UpdateVideoResourcesEvent {
  videoId: string;
  videos: Array<Omit<ProcessedVideo, 'size'> & { size: string }>;
  merge: boolean;
  updatedAt: Date;

  constructor(
    videoId: string,
    videos: Array<ProcessedVideo>,
    merge: boolean,
    updatedAt: Date,
  ) {
    this.videoId = videoId;
    this.videos = videos.map((v) => {
      if ('video' in v) delete v.video;
      return {
        ...v,
        size: v.size.toString(),
      };
    });
    this.merge = merge;
    this.updatedAt = updatedAt;
  }
}
