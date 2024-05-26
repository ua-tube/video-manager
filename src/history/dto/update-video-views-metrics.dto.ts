export class UpdateVideoViewsMetricsDto {
  videoId: string;
  viewsCount: number | string | bigint;
  updatedAt: Date;
}
