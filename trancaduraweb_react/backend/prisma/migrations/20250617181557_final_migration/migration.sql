/*
  Warnings:

  - You are about to alter the column `user_id` on the `device_pin_codes` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `user_id` on the `user_accesses` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `user_id` on the `user_cards` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `user_id` on the `user_roles` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `device_pin_codes` DROP FOREIGN KEY `device_pin_codes_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_accesses` DROP FOREIGN KEY `user_accesses_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_cards` DROP FOREIGN KEY `user_cards_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_roles` DROP FOREIGN KEY `user_roles_user_id_fkey`;

-- DropIndex
DROP INDEX `device_pin_codes_user_id_fkey` ON `device_pin_codes`;

-- DropIndex
DROP INDEX `user_accesses_user_id_fkey` ON `user_accesses`;

-- AlterTable
ALTER TABLE `device_pin_codes` MODIFY `user_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `user_accesses` MODIFY `user_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `user_cards` MODIFY `user_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `user_roles` MODIFY `user_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `device_pin_codes` ADD CONSTRAINT `device_pin_codes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_cards` ADD CONSTRAINT `user_cards_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_accesses` ADD CONSTRAINT `user_accesses_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
