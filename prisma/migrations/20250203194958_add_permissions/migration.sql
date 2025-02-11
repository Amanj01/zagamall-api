/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Permissions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Permissions_name_key` ON `Permissions`(`name`);
