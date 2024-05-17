import { VideoProcessingStatus } from '@prisma/client';

export class SetStatusDto {
  videoId: string;
  status: VideoProcessingStatus;
}
