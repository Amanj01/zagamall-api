/*
  Warnings:

  - You are about to drop the `blog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bloggallery` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `brand` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `brandresource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `brandsocial` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `form` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `formfield` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `formresponse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `formresponsedata` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `formresponsefile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `home` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `item` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `resource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `websitesocial` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `bloggallery` DROP FOREIGN KEY `BlogGallery_blogId_fkey`;

-- DropForeignKey
ALTER TABLE `brandresource` DROP FOREIGN KEY `BrandResource_brandId_fkey`;

-- DropForeignKey
ALTER TABLE `brandsocial` DROP FOREIGN KEY `BrandSocial_brandId_fkey`;

-- DropForeignKey
ALTER TABLE `comment` DROP FOREIGN KEY `Comment_brandId_fkey`;

-- DropForeignKey
ALTER TABLE `formfield` DROP FOREIGN KEY `FormField_formId_fkey`;

-- DropForeignKey
ALTER TABLE `formresponse` DROP FOREIGN KEY `FormResponse_formId_fkey`;

-- DropForeignKey
ALTER TABLE `formresponsedata` DROP FOREIGN KEY `FormResponseData_fieldId_fkey`;

-- DropForeignKey
ALTER TABLE `formresponsedata` DROP FOREIGN KEY `FormResponseData_responseId_fkey`;

-- DropForeignKey
ALTER TABLE `formresponsefile` DROP FOREIGN KEY `FormResponseFile_fieldId_fkey`;

-- DropForeignKey
ALTER TABLE `formresponsefile` DROP FOREIGN KEY `FormResponseFile_responseId_fkey`;

-- DropForeignKey
ALTER TABLE `item` DROP FOREIGN KEY `Item_brandId_fkey`;

-- DropTable
DROP TABLE `blog`;

-- DropTable
DROP TABLE `bloggallery`;

-- DropTable
DROP TABLE `brand`;

-- DropTable
DROP TABLE `brandresource`;

-- DropTable
DROP TABLE `brandsocial`;

-- DropTable
DROP TABLE `comment`;

-- DropTable
DROP TABLE `form`;

-- DropTable
DROP TABLE `formfield`;

-- DropTable
DROP TABLE `formresponse`;

-- DropTable
DROP TABLE `formresponsedata`;

-- DropTable
DROP TABLE `formresponsefile`;

-- DropTable
DROP TABLE `home`;

-- DropTable
DROP TABLE `item`;

-- DropTable
DROP TABLE `resource`;

-- DropTable
DROP TABLE `websitesocial`;

-- CreateTable
CREATE TABLE `Store` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `imagePath` VARCHAR(191) NULL,
    `isShowInHome` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dining` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `hours` VARCHAR(191) NULL,
    `rating` DOUBLE NULL,
    `imagePath` VARCHAR(191) NULL,
    `isShowInHome` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Promotion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `period` VARCHAR(191) NULL,
    `stores` VARCHAR(191) NULL,
    `description` TEXT NOT NULL,
    `imagePath` VARCHAR(191) NULL,
    `isShowInHome` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `About` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `image` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OurValue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `aboutId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FactAndFigure` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `number` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `aboutId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeamMember` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `bio` TEXT NOT NULL,
    `imagePath` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FAQ` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `question` VARCHAR(191) NOT NULL,
    `answer` TEXT NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactInquiry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `subject` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HomeSetting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `heroTitle` VARCHAR(191) NULL,
    `heroSubtitle` VARCHAR(191) NULL,
    `heroImage` VARCHAR(191) NULL,
    `quickInfoTitle` VARCHAR(191) NULL,
    `quickInfoContent` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OurValue` ADD CONSTRAINT `OurValue_aboutId_fkey` FOREIGN KEY (`aboutId`) REFERENCES `About`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FactAndFigure` ADD CONSTRAINT `FactAndFigure_aboutId_fkey` FOREIGN KEY (`aboutId`) REFERENCES `About`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
