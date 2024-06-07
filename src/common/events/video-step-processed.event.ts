export class VideoStepProcessedEvent {
  videoId: string;
  label: string;

  constructor(videoId: string, label: string) {
    this.videoId = videoId;
    this.label = label;
  }
}
