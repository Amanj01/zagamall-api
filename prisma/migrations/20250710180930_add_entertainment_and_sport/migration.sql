/*
  Warnings:

  - You are about to drop the column `category` on the `Dining` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Dining` table. All the data in the column will be lost.
  - You are about to drop the column `storeNum` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `features` on the `Office` table. All the data in the column will be lost.
  - You are about to drop the column `stores` on the `Promotion` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Dining` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationId` to the `Dining` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('STORE', 'OFFICE');

-- AlterTable
ALTER TABLE "Dining" DROP COLUMN "category",
DROP COLUMN "location",
ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD COLUMN     "locationId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "storeNum",
ADD COLUMN     "number" INTEGER NOT NULL,
ADD COLUMN     "type" "LocationType" NOT NULL;

-- AlterTable
ALTER TABLE "Office" DROP COLUMN "features",
ADD COLUMN     "isShowInHome" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Promotion" DROP COLUMN "stores";

-- CreateTable
CREATE TABLE "PromotionStore" (
    "id" SERIAL NOT NULL,
    "promotionId" INTEGER NOT NULL,
    "storeId" INTEGER NOT NULL,

    CONSTRAINT "PromotionStore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntertainmentAndSport" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "area" INTEGER,
    "locationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntertainmentAndSport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntertainmentAndSportGallery" (
    "id" SERIAL NOT NULL,
    "imagePath" TEXT NOT NULL,
    "entertainmentAndSportId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntertainmentAndSportGallery_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Dining" ADD CONSTRAINT "Dining_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dining" ADD CONSTRAINT "Dining_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionStore" ADD CONSTRAINT "PromotionStore_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionStore" ADD CONSTRAINT "PromotionStore_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntertainmentAndSport" ADD CONSTRAINT "EntertainmentAndSport_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntertainmentAndSportGallery" ADD CONSTRAINT "EntertainmentAndSportGallery_entertainmentAndSportId_fkey" FOREIGN KEY ("entertainmentAndSportId") REFERENCES "EntertainmentAndSport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
