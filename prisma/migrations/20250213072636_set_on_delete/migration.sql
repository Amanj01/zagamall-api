-- DropForeignKey
ALTER TABLE `bloggallery` DROP FOREIGN KEY `BlogGallery_blogId_fkey`;

-- DropForeignKey
ALTER TABLE `brandresource` DROP FOREIGN KEY `BrandResource_brandId_fkey`;

-- DropForeignKey
ALTER TABLE `brandsocial` DROP FOREIGN KEY `BrandSocial_brandId_fkey`;

-- DropForeignKey
ALTER TABLE `comment` DROP FOREIGN KEY `Comment_brandId_fkey`;

-- DropForeignKey
ALTER TABLE `eventgallery` DROP FOREIGN KEY `EventGallery_eventId_fkey`;

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

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_role_id_fkey`;

-- DropIndex
DROP INDEX `BlogGallery_blogId_fkey` ON `bloggallery`;

-- DropIndex
DROP INDEX `BrandResource_brandId_fkey` ON `brandresource`;

-- DropIndex
DROP INDEX `BrandSocial_brandId_fkey` ON `brandsocial`;

-- DropIndex
DROP INDEX `Comment_brandId_fkey` ON `comment`;

-- DropIndex
DROP INDEX `EventGallery_eventId_fkey` ON `eventgallery`;

-- DropIndex
DROP INDEX `FormField_formId_fkey` ON `formfield`;

-- DropIndex
DROP INDEX `FormResponse_formId_fkey` ON `formresponse`;

-- DropIndex
DROP INDEX `FormResponseData_fieldId_fkey` ON `formresponsedata`;

-- DropIndex
DROP INDEX `FormResponseData_responseId_fkey` ON `formresponsedata`;

-- DropIndex
DROP INDEX `FormResponseFile_fieldId_fkey` ON `formresponsefile`;

-- DropIndex
DROP INDEX `FormResponseFile_responseId_fkey` ON `formresponsefile`;

-- DropIndex
DROP INDEX `Item_brandId_fkey` ON `item`;

-- DropIndex
DROP INDEX `User_role_id_fkey` ON `user`;

-- AddForeignKey
ALTER TABLE `BrandSocial` ADD CONSTRAINT `BrandSocial_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brand`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brand`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brand`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BrandResource` ADD CONSTRAINT `BrandResource_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brand`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlogGallery` ADD CONSTRAINT `BlogGallery_blogId_fkey` FOREIGN KEY (`blogId`) REFERENCES `Blog`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventGallery` ADD CONSTRAINT `EventGallery_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FormField` ADD CONSTRAINT `FormField_formId_fkey` FOREIGN KEY (`formId`) REFERENCES `Form`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FormResponse` ADD CONSTRAINT `FormResponse_formId_fkey` FOREIGN KEY (`formId`) REFERENCES `Form`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FormResponseData` ADD CONSTRAINT `FormResponseData_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `FormField`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FormResponseData` ADD CONSTRAINT `FormResponseData_responseId_fkey` FOREIGN KEY (`responseId`) REFERENCES `FormResponse`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FormResponseFile` ADD CONSTRAINT `FormResponseFile_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `FormField`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FormResponseFile` ADD CONSTRAINT `FormResponseFile_responseId_fkey` FOREIGN KEY (`responseId`) REFERENCES `FormResponse`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
