import { VideoStatus, VideoVisibility } from '@prisma/client';

interface UpdateVideoConstructor {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  previewThumbnailUrl?: string;
  lengthSeconds: number;
  visibility: VideoVisibility;
}

export class UpdateVideoEvent implements UpdateVideoConstructor {
  id: string;
  title: string;
  description: string;
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
  tags: string;
  status: VideoStatus;
}

export class VideoStoreUpdateVideoEvent
  extends UpdateVideoEvent
  implements VideoStoreCreatorVideoConstructor
{
  tags: string;
  status: VideoStatus;

  constructor(video: VideoStoreCreatorVideoConstructor) {
    super(video);
    this.tags = video.tags;
    this.status = video.status;
  }
}

interface HistoryUpdateVideoConstructor extends UpdateVideoConstructor {
  tags: string;
}

export class HistoryUpdateVideoEvent
  extends UpdateVideoEvent
  implements HistoryUpdateVideoConstructor
{
  tags: string;

  constructor(video: HistoryUpdateVideoConstructor) {
    super(video);
    this.tags = video.tags;
  }
}

interface SearchUpdateVideoConstructor extends UpdateVideoConstructor {
  tags: string[];
  status: string;
}

export class SearchUpdateVideoEvent
  extends UpdateVideoEvent
  implements SearchUpdateVideoConstructor
{
  tags: string[];
  status: string;

  constructor(video: SearchUpdateVideoConstructor) {
    super(video);
    this.tags = video.tags;
    this.status = video.status;
  }
}
