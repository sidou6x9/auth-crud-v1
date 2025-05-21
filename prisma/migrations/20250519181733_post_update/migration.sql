/*
  Warnings:

  - You are about to drop the column `category` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Post` table. All the data in the column will be lost.
  - Added the required column `readTime` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "category",
DROP COLUMN "image",
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "readTime" INTEGER NOT NULL;
