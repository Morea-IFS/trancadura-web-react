-- CreateTable
CREATE TABLE `TemporaryAccessRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `labId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `expiresAt` DATETIME(3) NULL,
    `isOneTime` BOOLEAN NOT NULL DEFAULT false,
    `approved` BOOLEAN NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TemporaryAccessRequest` ADD CONSTRAINT `TemporaryAccessRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TemporaryAccessRequest` ADD CONSTRAINT `TemporaryAccessRequest_labId_fkey` FOREIGN KEY (`labId`) REFERENCES `Lab`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
