/*
  Warnings:

  - You are about to drop the column `allowed_to_publish` on the `videos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "videos" DROP COLUMN "allowed_to_publish";

-- CreateIndex
CREATE INDEX "videos_is_published_visibility_idx" ON "videos"("is_published", "visibility");
