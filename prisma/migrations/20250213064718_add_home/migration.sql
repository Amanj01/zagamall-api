/*
  Warnings:

  - You are about to drop the column `fileType` on the `brandresource` table. All the data in the column will be lost.
  - You are about to alter the column `options` on the `formfield` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - Added the required column `coverImage` to the `Blog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coverImage` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `blog` ADD COLUMN `coverImage` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `brandresource` DROP COLUMN `fileType`;

-- AlterTable
ALTER TABLE `event` ADD COLUMN `coverImage` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `formfield` MODIFY `options` JSON NULL;

-- CreateTable
CREATE TABLE `Home` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `coverMedia` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
