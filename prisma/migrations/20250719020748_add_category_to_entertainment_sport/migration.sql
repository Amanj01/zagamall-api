/*
  Warnings:

  - You are about to drop the column `categoryId` on the `EntertainmentAndSport` table. All the data in the column will be lost.
  - You are about to drop the `EntertainmentAndSportCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EntertainmentAndSportCategory" AS ENUM ('SPORT', 'ENTERTAINMENT');

-- DropForeignKey
ALTER TABLE "EntertainmentAndSport" DROP CONSTRAINT "EntertainmentAndSport_categoryId_fkey";

-- AlterTable
ALTER TABLE "EntertainmentAndSport" DROP COLUMN "categoryId",
ADD COLUMN     "category" "EntertainmentAndSportCategory" NOT NULL DEFAULT 'ENTERTAINMENT';

-- DropTable
DROP TABLE "EntertainmentAndSportCategory";
