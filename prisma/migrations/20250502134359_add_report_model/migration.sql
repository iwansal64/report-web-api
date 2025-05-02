-- CreateTable
CREATE TABLE `Report` (
    `id` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `type` ENUM('VR', 'Safety', 'SOP') NOT NULL,
    `follow_up` ENUM('Guru', 'Siswa', 'Vendor') NOT NULL,
    `pic_name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_pic_name_fkey` FOREIGN KEY (`pic_name`) REFERENCES `User`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;
