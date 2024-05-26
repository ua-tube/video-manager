-- AlterTable
ALTER TABLE "video_metrics" ADD COLUMN     "comments_count_updated_at" TIMESTAMPTZ(6),
ADD COLUMN     "views_count_updated_at" TIMESTAMPTZ(6),
ADD COLUMN     "votes_count_updated_at" TIMESTAMPTZ(6);
