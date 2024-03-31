-- CreateEnum
CREATE TYPE "video_statuses" AS ENUM ('Created', 'Registered', 'RegistrationFailed', 'Unregistered');

-- CreateEnum
CREATE TYPE "video_visibilities" AS ENUM ('Private', 'Unlisted', 'Public');

-- CreateEnum
CREATE TYPE "video_processing_statuses" AS ENUM ('WaitingForUserUpload', 'VideoUploaded', 'VideoBeingProcessed', 'VideoProcessed', 'VideoProcessingFailed');

-- CreateEnum
CREATE TYPE "video_thumbnail_statuses" AS ENUM ('Waiting', 'Processed');

-- CreateTable
CREATE TABLE "creators" (
    "id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "thumbnail_url" TEXT,

    CONSTRAINT "creators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" UUID NOT NULL,
    "creator_id" TEXT NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "description" TEXT,
    "tags" TEXT,
    "thumbnail_id" UUID,
    "status" "video_statuses" NOT NULL,
    "visibility" "video_visibilities" NOT NULL,
    "allowed_to_publish" BOOLEAN NOT NULL,
    "is_published" BOOLEAN NOT NULL,
    "processing_status" "video_processing_statuses" NOT NULL,
    "original_video_file_id" UUID NOT NULL,
    "original_video_file_name" TEXT,
    "original_video_url" TEXT,
    "thumbnail_status" "video_thumbnail_statuses" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMPTZ(6),
    "unpublished_at" TIMESTAMPTZ(6),

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_metrics" (
    "videoId" UUID NOT NULL,
    "views_count" BIGINT NOT NULL DEFAULT 0,
    "comments_count" BIGINT NOT NULL DEFAULT 0,
    "likes_count" BIGINT NOT NULL DEFAULT 0,
    "dislikes_count" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "video_metrics_pkey" PRIMARY KEY ("videoId")
);

-- CreateTable
CREATE TABLE "processed_videos" (
    "id" UUID NOT NULL,
    "video_file_id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "video_id" UUID NOT NULL,

    CONSTRAINT "processed_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_thumbnails" (
    "image_file_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "video_id" UUID NOT NULL,

    CONSTRAINT "video_thumbnails_pkey" PRIMARY KEY ("image_file_id")
);

-- CreateTable
CREATE TABLE "video_preview_thumbnails" (
    "image_file_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "videoId" UUID NOT NULL,

    CONSTRAINT "video_preview_thumbnails_pkey" PRIMARY KEY ("image_file_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "video_preview_thumbnails_videoId_key" ON "video_preview_thumbnails"("videoId");

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_metrics" ADD CONSTRAINT "video_metrics_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processed_videos" ADD CONSTRAINT "processed_videos_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_thumbnails" ADD CONSTRAINT "video_thumbnails_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_preview_thumbnails" ADD CONSTRAINT "video_preview_thumbnails_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
