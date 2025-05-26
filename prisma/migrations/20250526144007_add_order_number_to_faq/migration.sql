/*
  Warnings:

  - You are about to drop the `homesetting` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `faq` ADD COLUMN `orderNumber` INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE `homesetting`;
