export class AddProcessedVideoDto {
  videoId: string;
  url: string;
  label: string;
  width: number;
  height: number;
  lengthSeconds?: number;
  size: string | number | bigint;
}
