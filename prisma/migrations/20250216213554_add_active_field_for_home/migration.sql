/*
  Warnings:

  - Added the required column `active` to the `Home` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `home` ADD COLUMN `active` BOOLEAN NOT NULL;
