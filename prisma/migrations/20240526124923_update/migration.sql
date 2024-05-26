/*
  Warnings:

  - Made the column `description` on table `videos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tags` on table `videos` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "published_at" TIMESTAMPTZ(6),
ADD COLUMN     "unpublished_at" TIMESTAMPTZ(6),
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "description" SET DEFAULT '',
ALTER COLUMN "tags" SET NOT NULL,
ALTER COLUMN "tags" SET DEFAULT '';
