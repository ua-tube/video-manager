export class UpdateVideoVotesMetricsDto {
  videoId: string;
  likesCount: number | string | bigint;
  dislikesCount: number | string | bigint;
  updatedAt: Date;
}
