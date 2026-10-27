-- CreateTable
CREATE TABLE `patient_history_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `patient_record_id` BIGINT NOT NULL,
    `category` ENUM('CONDITION', 'SURGERY', 'ALLERGY', 'MEDICATION', 'FAMILY_HISTORY', 'OTHER') NOT NULL,
    `description` TEXT NOT NULL,
    `relative` VARCHAR(100) NULL,
    `onset_date` DATE NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL,

    INDEX `patient_history_items_patient_record_id_category_idx`(`patient_record_id`, `category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `patient_history_items` ADD CONSTRAINT `patient_history_items_patient_record_id_fkey` FOREIGN KEY (`patient_record_id`) REFERENCES `patient_records`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;