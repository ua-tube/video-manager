import { Video } from '@prisma/client';

export class SyncVideoEvent {
  video: Video;
  thumbnailUrl: string;
  previewThumbnailUrl?: string;

  constructor(
    video: Video,
    thumbnailUrl: string,
    previewThumbnailUrl?: string,
  ) {
    this.video = video;
    this.thumbnailUrl = thumbnailUrl;
    this.previewThumbnailUrl = previewThumbnailUrl;
  }
}
