/*
  Warnings:

  - You are about to drop the `processed_videos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "processed_videos" DROP CONSTRAINT "processed_videos_video_id_fkey";

-- DropTable
DROP TABLE "processed_videos";
