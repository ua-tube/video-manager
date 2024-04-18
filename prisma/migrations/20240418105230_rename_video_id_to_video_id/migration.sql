/*
  Warnings:

  - The primary key for the `video_metrics` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `videoId` on the `video_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `videoId` on the `video_preview_thumbnails` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[video_id]` on the table `video_preview_thumbnails` will be added. If there are existing duplicate values, this will fail.
  - The required column `video_id` was added to the `video_metrics` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `video_id` was added to the `video_preview_thumbnails` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "video_metrics" DROP CONSTRAINT "video_metrics_videoId_fkey";

-- DropForeignKey
ALTER TABLE "video_preview_thumbnails" DROP CONSTRAINT "video_preview_thumbnails_videoId_fkey";

-- DropIndex
DROP INDEX "video_preview_thumbnails_videoId_key";

-- AlterTable
ALTER TABLE "video_metrics" DROP CONSTRAINT "video_metrics_pkey",
DROP COLUMN "videoId",
ADD COLUMN     "video_id" UUID NOT NULL,
ADD CONSTRAINT "video_metrics_pkey" PRIMARY KEY ("video_id");

-- AlterTable
ALTER TABLE "video_preview_thumbnails" DROP COLUMN "videoId",
ADD COLUMN     "video_id" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "video_preview_thumbnails_video_id_key" ON "video_preview_thumbnails"("video_id");

-- AddForeignKey
ALTER TABLE "video_metrics" ADD CONSTRAINT "video_metrics_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_preview_thumbnails" ADD CONSTRAINT "video_preview_thumbnails_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
