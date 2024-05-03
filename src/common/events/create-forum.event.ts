export class CreateForumEvent {
  videoId: string
  creatorId: string

  constructor(videoId: string,creatorId: string) {
    this.videoId = videoId;
    this.creatorId = creatorId
  }
}
