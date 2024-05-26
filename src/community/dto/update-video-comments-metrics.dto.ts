export class UpdateVideoCommentsMetricsDto {
  videoId: string;
  commentsCount: number | string | bigint;
  updatedAt: Date;
}
