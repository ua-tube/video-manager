/*
  Warnings:

  - You are about to drop the column `length_seconds` on the `processed_videos` table. All the data in the column will be lost.
  - Added the required column `length_seconds` to the `videos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "processed_videos" DROP COLUMN "length_seconds";

-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "length_seconds" INTEGER NOT NULL;
