-- Add columns with default values
ALTER TABLE `brandresource` 
    ADD COLUMN `description` VARCHAR(191) NOT NULL DEFAULT 'default description',
    ADD COLUMN `fileType` VARCHAR(191) NOT NULL DEFAULT 'default fileType',
    ADD COLUMN `title` VARCHAR(191) NOT NULL DEFAULT 'default title';

ALTER TABLE `resource` 
    ADD COLUMN `fileType` VARCHAR(191) NOT NULL DEFAULT 'default fileType';

-- Remove default values after columns are added
ALTER TABLE `brandresource` 
    ALTER COLUMN `description` DROP DEFAULT,
    ALTER COLUMN `fileType` DROP DEFAULT,
    ALTER COLUMN `title` DROP DEFAULT;

ALTER TABLE `resource` 
    ALTER COLUMN `fileType` DROP DEFAULT;

-- CreateTable
CREATE TABLE `ContactMe` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;