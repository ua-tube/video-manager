import { VideoStatus, VideoVisibility } from '@prisma/client';

export class SyncVideoDto {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  tags: string;
  thumbnailUrl: string;
  previewThumbnailUrl?: string;
  lengthSeconds: number;
  visibility: VideoVisibility;
  status: VideoStatus;
  createdAt: Date;
}
