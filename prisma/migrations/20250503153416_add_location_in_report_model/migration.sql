-- AlterTable
ALTER TABLE `report` ADD COLUMN `location` VARCHAR(191) NULL,
    MODIFY `status` ENUM('Pending', 'OnProgress', 'Completed') NOT NULL DEFAULT 'Pending';
