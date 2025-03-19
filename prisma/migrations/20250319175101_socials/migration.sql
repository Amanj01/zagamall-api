/*
  Warnings:

  - Added the required column `clickable` to the `WebsiteSocial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `showIcon` to the `WebsiteSocial` table without a default value. This is not possible if the table is not empty.

*/
-- Add columns with default values
ALTER TABLE `websitesocial` 
    ADD COLUMN `clickable` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `showIcon` BOOLEAN NOT NULL DEFAULT false;

