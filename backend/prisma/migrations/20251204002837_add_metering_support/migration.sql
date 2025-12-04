-- AlterTable
ALTER TABLE `devices` ADD COLUMN `isAuthorized` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `name` VARCHAR(191) NULL,
    ADD COLUMN `type` ENUM('ACCESS_CONTROL', 'WATER_METER', 'ENERGY_METER', 'GAS_METER') NOT NULL DEFAULT 'ACCESS_CONTROL';

-- CreateTable
CREATE TABLE `MeterReading` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `deviceId` INTEGER NOT NULL,
    `type` INTEGER NOT NULL,
    `value` DOUBLE NOT NULL,
    `total` DOUBLE NOT NULL,
    `collectedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MeterReading_deviceId_collectedAt_idx`(`deviceId`, `collectedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MeterReading` ADD CONSTRAINT `MeterReading_deviceId_fkey` FOREIGN KEY (`deviceId`) REFERENCES `devices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
