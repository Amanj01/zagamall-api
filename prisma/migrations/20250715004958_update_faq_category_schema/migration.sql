/*
  Warnings:

  - Added the required column `updatedAt` to the `FAQCategory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FAQCategory" ADD COLUMN     "description" TEXT,
ADD COLUMN     "orderNumber" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
