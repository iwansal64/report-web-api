/*
  Warnings:

  - Added the required column `status` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `report` ADD COLUMN `status` ENUM('Pending', 'OnProgress', 'Completed') NOT NULL;
