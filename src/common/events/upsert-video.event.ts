import { VideoStatus, VideoVisibility } from '@prisma/client';

export class UpsertVideoEvent {
  id: string;
  creatorId: string
  title: string;
  thumbnailUrl?: string
  previewThumbnailUrl?: string
  visibility: VideoVisibility
  status: VideoStatus
  createdAt: Date

  constructor(video: {
    id: string
    creatorId: string
    title: string
    thumbnailUrl?: string
    previewThumbnailUrl?: string
    visibility: VideoVisibility
    status: VideoStatus
    createdAt: Date
  }) {
    this.id = video.id;
    this.creatorId = video.creatorId;
    this.title = video.title;
    this.thumbnailUrl = video.thumbnailUrl;
    this.previewThumbnailUrl = video.previewThumbnailUrl
    this.visibility = video.visibility
    this.status = video.status
    this.createdAt = video.createdAt
  }
}
