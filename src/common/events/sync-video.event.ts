import { Video } from '@prisma/client';
import { SyncVideoDto } from '../../video-manager/dto';

export class SyncVideoEvent extends SyncVideoDto {
  constructor(
    video: Video,
    thumbnailUrl: string,
    previewThumbnailUrl?: string,
  ) {
    super();
    this.id = video.id;
    this.creatorId = video.creatorId;
    this.title = video.title;
    this.description = video.description;
    this.tags = video.tags;
    this.thumbnailUrl = thumbnailUrl;
    this.previewThumbnailUrl = previewThumbnailUrl;
    this.lengthSeconds = video.lengthSeconds;
    this.visibility = video.visibility;
    this.status = video.status;
    this.createdAt = video.createdAt;
  }
}
