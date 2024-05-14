/*
  Warnings:

  - The primary key for the `creators` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `creators` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `creator_id` on the `videos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "videos" DROP CONSTRAINT "videos_creator_id_fkey";

-- AlterTable
ALTER TABLE "creators" DROP CONSTRAINT "creators_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "creators_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "videos" DROP COLUMN "creator_id",
ADD COLUMN     "creator_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creators"("id") ON DELETE CASCADE ON UPDATE CASCADE;
