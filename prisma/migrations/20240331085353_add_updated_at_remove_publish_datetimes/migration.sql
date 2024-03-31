/*
  Warnings:

  - You are about to drop the column `published_at` on the `videos` table. All the data in the column will be lost.
  - You are about to drop the column `unpublished_at` on the `videos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "videos" DROP COLUMN "published_at",
DROP COLUMN "unpublished_at",
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;
