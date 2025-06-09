/*
  Warnings:

  - You are about to drop the column `showOnHomepage` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `showOnHomepage` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the `EventGallery` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EventGallery" DROP CONSTRAINT "EventGallery_eventId_fkey";

-- AlterTable
ALTER TABLE "Brand" DROP COLUMN "showOnHomepage",
ADD COLUMN     "isShowInHome" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "showOnHomepage",
ADD COLUMN     "isShowInHome" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "EventGallery";

-- CreateTable
CREATE TABLE "HomeSetting" (
    "id" SERIAL NOT NULL,
    "quickInfoTitle" TEXT,
    "quickInfoContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroImage" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imagePath" TEXT NOT NULL,
    "orderNumber" INTEGER NOT NULL DEFAULT 0,
    "homeSettingId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HeroImage" ADD CONSTRAINT "HeroImage_homeSettingId_fkey" FOREIGN KEY ("homeSettingId") REFERENCES "HomeSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
