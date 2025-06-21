/*
  Warnings:

  - You are about to drop the column `is_superuser` on the `users` table. All the data in the column will be lost.
  - Added the required column `user_username` to the `user_accesses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user_accesses` ADD COLUMN `user_username` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `is_superuser`;
