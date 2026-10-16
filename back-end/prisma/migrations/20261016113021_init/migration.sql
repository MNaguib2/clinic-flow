-- AlterTable
ALTER TABLE `expenses` MODIFY `expense_date` DATE NOT NULL DEFAULT (CURRENT_DATE);

-- AlterTable
ALTER TABLE `prescription_items` ADD COLUMN `doctor_drug_id` BIGINT NULL;

-- CreateTable
CREATE TABLE `drugs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(200) NOT NULL,
    `active_ingredient` VARCHAR(200) NULL,
    `concentration` VARCHAR(100) NULL,
    `dosage_form` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL,

    INDEX `drugs_name_idx`(`name`),
    INDEX `drugs_active_ingredient_idx`(`active_ingredient`),
    INDEX `drugs_is_active_name_idx`(`is_active`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `doctor_drugs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `drug_id` BIGINT NULL,
    `custom_name` VARCHAR(200) NULL,
    `custom_description` TEXT NULL,
    `default_dosage` VARCHAR(100) NULL,
    `default_frequency` VARCHAR(100) NULL,
    `default_duration` VARCHAR(100) NULL,
    `default_instructions` TEXT NULL,
    `is_favorite` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL,

    INDEX `doctor_drugs_user_id_idx`(`user_id`),
    INDEX `doctor_drugs_drug_id_idx`(`drug_id`),
    UNIQUE INDEX `doctor_drugs_user_id_drug_id_key`(`user_id`, `drug_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `prescription_items_doctor_drug_id_idx` ON `prescription_items`(`doctor_drug_id`);

-- AddForeignKey
ALTER TABLE `doctor_drugs` ADD CONSTRAINT `doctor_drugs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_drugs` ADD CONSTRAINT `doctor_drugs_drug_id_fkey` FOREIGN KEY (`drug_id`) REFERENCES `drugs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prescription_items` ADD CONSTRAINT `prescription_items_doctor_drug_id_fkey` FOREIGN KEY (`doctor_drug_id`) REFERENCES `doctor_drugs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `prescription_items` RENAME INDEX `prescription_items_prescription_id_fkey` TO `prescription_items_prescription_id_idx`;
