/*
  Warnings:

  - You are about to drop the `button_devices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `buttons` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[labId]` on the table `devices` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `button_devices` DROP FOREIGN KEY `button_devices_button_id_fkey`;

-- DropForeignKey
ALTER TABLE `button_devices` DROP FOREIGN KEY `button_devices_device_id_fkey`;

-- AlterTable
ALTER TABLE `devices` ADD COLUMN `labId` INTEGER NULL;

-- DropTable
DROP TABLE `button_devices`;

-- DropTable
DROP TABLE `buttons`;

-- CreateTable
CREATE TABLE `Lab` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `deviceId` INTEGER NULL,

    UNIQUE INDEX `Lab_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserLab` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `labId` INTEGER NOT NULL,

    UNIQUE INDEX `UserLab_userId_labId_key`(`userId`, `labId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `devices_labId_key` ON `devices`(`labId`);

-- AddForeignKey
ALTER TABLE `UserLab` ADD CONSTRAINT `UserLab_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserLab` ADD CONSTRAINT `UserLab_labId_fkey` FOREIGN KEY (`labId`) REFERENCES `Lab`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `devices` ADD CONSTRAINT `devices_labId_fkey` FOREIGN KEY (`labId`) REFERENCES `Lab`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
