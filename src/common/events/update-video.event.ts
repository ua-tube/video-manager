import { VideoStatus, VideoVisibility } from '@prisma/client';

interface UpdateVideoConstructor {
  id: string;
  title: string;
  thumbnailUrl?: string;
  previewThumbnailUrl?: string;
  lengthSeconds: number;
  visibility: VideoVisibility;
}

export class UpdateVideoEvent implements UpdateVideoConstructor {
  id: string;
  title: string;
  thumbnailUrl: string;
  previewThumbnailUrl?: string;
  lengthSeconds: number;
  visibility: VideoVisibility;

  constructor(video: UpdateVideoConstructor) {
    this.id = video.id;
    this.title = video.title;
    this.thumbnailUrl = video.thumbnailUrl;
    this.previewThumbnailUrl = video.previewThumbnailUrl;
    this.lengthSeconds = video.lengthSeconds;
    this.visibility = video.visibility;
  }
}

interface LibraryUpdateVideoConstructor extends UpdateVideoConstructor {
  status: VideoStatus;
}

export class LibraryUpdateVideoEvent
  extends UpdateVideoEvent
  implements LibraryUpdateVideoConstructor
{
  status: VideoStatus;

  constructor(video: LibraryUpdateVideoConstructor) {
    super(video);
    this.status = video.status;
  }
}

interface VideoStoreCreatorVideoConstructor extends UpdateVideoConstructor {
  description: string;
  tags: string;
  status: VideoStatus;
}

export class VideoStoreUpdateVideoEvent
  extends UpdateVideoEvent
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

interface HistoryUpdateVideoConstructor extends UpdateVideoConstructor {
  description: string;
  tags: string;
}

export class HistoryUpdateVideoEvent
  extends UpdateVideoEvent
  implements HistoryUpdateVideoConstructor
{
  description: string;
  tags: string;

  constructor(video: HistoryUpdateVideoConstructor) {
    super(video);
    this.description = video.description;
    this.tags = video.tags;
  }
}

interface SearchUpdateVideoConstructor extends UpdateVideoConstructor {
  description: string;
  tags: string[];
  status: string;
}

export class SearchUpdateVideoEvent
  extends UpdateVideoEvent
  implements SearchUpdateVideoConstructor
{
  description: string;
  tags: string[];
  status: string;

  constructor(video: SearchUpdateVideoConstructor) {
    super(video);
    this.description = video.description;
    this.tags = video.tags;
    this.status = video.status;
  }
}
