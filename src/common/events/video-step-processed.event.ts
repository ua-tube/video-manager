export class VideoStepProcessedEvent {
  userId: string;
  videoId: string;
  label: string;

  constructor(userId: string, videoId: string, label: string) {
    this.userId = userId;
    this.videoId = videoId;
    this.label = label;
  }
}
