export class SetVideoIsPublishedEvent {
  videoId: string;

  constructor(videoId: string) {
    this.videoId = videoId;
  }
}
