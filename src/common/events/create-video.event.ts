import { VideoStatus, VideoVisibility } from '@prisma/client';

interface CreateVideoConstructor {
  id: string;
  creatorId: string;
  title: string;
  thumbnailUrl?: string;
  previewThumbnailUrl?: string;
  lengthSeconds: number;
  visibility: VideoVisibility;
  createdAt: Date;
}

export class CreateVideoEvent implements CreateVideoConstructor {
  id: string;
  creatorId: string;
  title: string;
  thumbnailUrl: string;
  previewThumbnailUrl: string;
  lengthSeconds: number;
  visibility: VideoVisibility;
  createdAt: Date;

  constructor(video: CreateVideoConstructor) {
    this.id = video.id;
    this.creatorId = video.creatorId;
    this.title = video.title;
    this.thumbnailUrl = video.thumbnailUrl;
    this.previewThumbnailUrl = video.previewThumbnailUrl;
    this.lengthSeconds = video.lengthSeconds;
    this.visibility = video.visibility;
    this.createdAt = video.createdAt;
  }
}

interface LibraryCreateVideoConstructor extends CreateVideoConstructor {
  description: string;
  tags: string;
  status: VideoStatus;
}

export class LibraryCreateVideoEvent
  extends CreateVideoEvent
  implements LibraryCreateVideoConstructor
{
  description: string;
  tags: string;
  status: VideoStatus;

  constructor(video: LibraryCreateVideoConstructor) {
    super(video);
    this.description = video.description;
    this.tags = video.tags;
    this.status = video.status;
  }
}

interface VideoStoreCreatorVideoConstructor extends CreateVideoConstructor {
  description: string;
  tags: string;
  status: VideoStatus;
}

export class VideoStoreCreateVideoEvent
  extends CreateVideoEvent
  implements VideoStoreCreatorVideoConstructor
{
  description: string;
  tags: string;
  status: VideoStatus;

  constructor(video: VideoStoreCreatorVideoConstructor) {
    super(video);
    this.description = video.description;
    this.tags = video.tags;
    this.status = video.status;
  }
}

interface HistoryCreateVideoConstructor extends CreateVideoConstructor {
  description: string;
  tags: string;
}

export class HistoryCreateVideoEvent
  extends CreateVideoEvent
  implements HistoryCreateVideoConstructor
{
  description: string;
  tags: string;

  constructor(video: HistoryCreateVideoConstructor) {
    super(video);
    this.description = video.description;
    this.tags = video.tags;
  }
}

interface SearchCreateVideoConstructor extends CreateVideoConstructor {
  description: string;
  tags: string[];
  status: string;
}

export class SearchCreateVideoEvent
  extends CreateVideoEvent
  implements SearchCreateVideoConstructor
{
  description: string;
  tags: string[];
  status: string;

  constructor(video: SearchCreateVideoConstructor) {
    super(video);
    this.description = video.description;
    this.tags = video.tags;
    this.status = video.status;
  }
}
