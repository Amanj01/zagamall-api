/*
  Warnings:

  - Added the required column `fileType` to the `Home` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `home` ADD COLUMN `fileType` VARCHAR(191) NOT NULL DEFAULT "default type";
