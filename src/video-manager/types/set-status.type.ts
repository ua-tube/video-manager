import { VideoProcessingStatus } from '@prisma/client';

export type SetStatus = {
  videoId: string,
  status: VideoProcessingStatus
}
