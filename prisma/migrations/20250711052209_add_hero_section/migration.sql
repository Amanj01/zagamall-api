/*
  Warnings:

  - You are about to drop the `HeroImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "HeroImage" DROP CONSTRAINT "HeroImage_homeSettingId_fkey";

-- DropTable
DROP TABLE "HeroImage";

-- CreateTable
CREATE TABLE "HeroSection" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imagePath" TEXT NOT NULL,
    "orderNumber" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSection_pkey" PRIMARY KEY ("id")
);
