/*
  Warnings:

  - Added the required column `height` to the `processed_videos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `length_seconds` to the `processed_videos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `processed_videos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `processed_videos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "processed_videos" DROP CONSTRAINT "processed_videos_video_id_fkey";

-- DropForeignKey
ALTER TABLE "video_metrics" DROP CONSTRAINT "video_metrics_video_id_fkey";

-- DropForeignKey
ALTER TABLE "video_preview_thumbnails" DROP CONSTRAINT "video_preview_thumbnails_video_id_fkey";

-- DropForeignKey
ALTER TABLE "video_thumbnails" DROP CONSTRAINT "video_thumbnails_video_id_fkey";

-- AlterTable
ALTER TABLE "processed_videos" ADD COLUMN     "height" INTEGER NOT NULL,
ADD COLUMN     "length_seconds" INTEGER NOT NULL,
ADD COLUMN     "size" BIGINT NOT NULL,
ADD COLUMN     "width" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "video_metrics" ADD CONSTRAINT "video_metrics_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processed_videos" ADD CONSTRAINT "processed_videos_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_thumbnails" ADD CONSTRAINT "video_thumbnails_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_preview_thumbnails" ADD CONSTRAINT "video_preview_thumbnails_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
