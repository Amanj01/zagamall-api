/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `PasswordTokens` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `PasswordTokens_token_key` ON `PasswordTokens`(`token`);
