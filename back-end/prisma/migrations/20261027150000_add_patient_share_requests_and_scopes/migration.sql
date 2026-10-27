-- CreateIndex
CREATE UNIQUE INDEX `patient_records_organization_id_id_patient_account_id_key` ON `patient_records`(`organization_id`, `id`, `patient_account_id`);

-- CreateTable
CREATE TABLE `patient_share_requests` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `patient_account_id` BIGINT NOT NULL,
    `to_organization_id` BIGINT NOT NULL,
    `target_patient_record_id` BIGINT NOT NULL,
    `target_doctor_id` BIGINT NULL,
    `requested_by_user_id` BIGINT NOT NULL,
    `reason` TEXT NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'DECLINED', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    `requested_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `expires_at` DATETIME(6) NOT NULL,
    `responded_at` DATETIME(6) NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL,

    INDEX `patient_share_requests_patient_account_id_status_idx`(`patient_account_id`, `status`),
    INDEX `patient_share_requests_to_organization_id_status_idx`(`to_organization_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `patient_shares`
    ADD COLUMN `request_id` BIGINT NULL,
    ADD COLUMN `from_patient_record_id` BIGINT NULL,
    ADD COLUMN `to_patient_record_id` BIGINT NULL,
    ADD COLUMN `reason` TEXT NULL,
    ADD COLUMN `history_mode` ENUM('NONE', 'ALL_CURRENT', 'SELECTED') NOT NULL DEFAULT 'NONE',
    ADD COLUMN `case_mode` ENUM('NONE', 'ALL_CURRENT', 'SELECTED') NOT NULL DEFAULT 'NONE',
    ADD COLUMN `visit_mode` ENUM('NONE', 'ALL_CURRENT', 'SELECTED') NOT NULL DEFAULT 'NONE',
    ADD COLUMN `expires_at` DATETIME(6) NULL;

-- CreateTable
CREATE TABLE `patient_share_history_items` (
    `share_id` BIGINT NOT NULL,
    `history_item_id` BIGINT NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `patient_share_history_items_history_item_id_idx`(`history_item_id`),
    PRIMARY KEY (`share_id`, `history_item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patient_share_medical_cases` (
    `share_id` BIGINT NOT NULL,
    `medical_case_id` BIGINT NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `patient_share_medical_cases_medical_case_id_idx`(`medical_case_id`),
    PRIMARY KEY (`share_id`, `medical_case_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patient_share_visits` (
    `share_id` BIGINT NOT NULL,
    `visit_id` BIGINT NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `patient_share_visits_visit_id_idx`(`visit_id`),
    PRIMARY KEY (`share_id`, `visit_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patient_share_attachments` (
    `share_id` BIGINT NOT NULL,
    `attachment_id` BIGINT NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `patient_share_attachments_attachment_id_idx`(`attachment_id`),
    PRIMARY KEY (`share_id`, `attachment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patient_share_access_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `share_id` BIGINT NOT NULL,
    `accessed_by_user_id` BIGINT NULL,
    `attachment_id` BIGINT NULL,
    `action` ENUM('VIEW', 'DOWNLOAD') NOT NULL,
    `ip_address` VARCHAR(45) NULL,
    `accessed_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `patient_share_access_logs_share_id_accessed_at_idx`(`share_id`, `accessed_at`),
    INDEX `patient_share_access_logs_accessed_by_user_id_accessed_at_idx`(`accessed_by_user_id`, `accessed_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `patient_shares_request_id_key` ON `patient_shares`(`request_id`);
CREATE INDEX `patient_shares_from_organization_id_from_patient_record_id_idx` ON `patient_shares`(`from_organization_id`, `from_patient_record_id`);
CREATE INDEX `patient_shares_to_organization_id_to_patient_record_id_idx` ON `patient_shares`(`to_organization_id`, `to_patient_record_id`);

-- AddForeignKey
ALTER TABLE `patient_share_requests` ADD CONSTRAINT `patient_share_requests_patient_account_id_fkey` FOREIGN KEY (`patient_account_id`) REFERENCES `patient_accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `patient_share_requests` ADD CONSTRAINT `patient_share_requests_to_organization_id_fkey` FOREIGN KEY (`to_organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `patient_share_requests` ADD CONSTRAINT `patient_share_requests_target_record_fkey` FOREIGN KEY (`to_organization_id`, `target_patient_record_id`, `patient_account_id`) REFERENCES `patient_records`(`organization_id`, `id`, `patient_account_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `patient_share_requests` ADD CONSTRAINT `patient_share_requests_target_doctor_fkey` FOREIGN KEY (`to_organization_id`, `target_doctor_id`) REFERENCES `users`(`organization_id`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `patient_share_requests` ADD CONSTRAINT `patient_share_requests_requested_by_fkey` FOREIGN KEY (`to_organization_id`, `requested_by_user_id`) REFERENCES `users`(`organization_id`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `patient_shares` ADD CONSTRAINT `patient_shares_request_id_fkey` FOREIGN KEY (`request_id`) REFERENCES `patient_share_requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `patient_shares` ADD CONSTRAINT `patient_shares_source_record_fkey` FOREIGN KEY (`from_organization_id`, `from_patient_record_id`, `patient_account_id`) REFERENCES `patient_records`(`organization_id`, `id`, `patient_account_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `patient_shares` ADD CONSTRAINT `patient_shares_target_record_fkey` FOREIGN KEY (`to_organization_id`, `to_patient_record_id`, `patient_account_id`) REFERENCES `patient_records`(`organization_id`, `id`, `patient_account_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_share_history_items` ADD CONSTRAINT `patient_share_history_items_share_id_fkey` FOREIGN KEY (`share_id`) REFERENCES `patient_shares`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `patient_share_history_items` ADD CONSTRAINT `patient_share_history_items_history_item_id_fkey` FOREIGN KEY (`history_item_id`) REFERENCES `patient_history_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `patient_share_medical_cases` ADD CONSTRAINT `patient_share_medical_cases_share_id_fkey` FOREIGN KEY (`share_id`) REFERENCES `patient_shares`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `patient_share_medical_cases` ADD CONSTRAINT `patient_share_medical_cases_medical_case_id_fkey` FOREIGN KEY (`medical_case_id`) REFERENCES `medical_cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `patient_share_visits` ADD CONSTRAINT `patient_share_visits_share_id_fkey` FOREIGN KEY (`share_id`) REFERENCES `patient_shares`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `patient_share_visits` ADD CONSTRAINT `patient_share_visits_visit_id_fkey` FOREIGN KEY (`visit_id`) REFERENCES `visits`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `patient_share_attachments` ADD CONSTRAINT `patient_share_attachments_share_id_fkey` FOREIGN KEY (`share_id`) REFERENCES `patient_shares`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `patient_share_attachments` ADD CONSTRAINT `patient_share_attachments_attachment_id_fkey` FOREIGN KEY (`attachment_id`) REFERENCES `attachments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `patient_share_access_logs` ADD CONSTRAINT `patient_share_access_logs_share_id_fkey` FOREIGN KEY (`share_id`) REFERENCES `patient_shares`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `patient_share_access_logs` ADD CONSTRAINT `patient_share_access_logs_accessed_by_user_id_fkey` FOREIGN KEY (`accessed_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `patient_share_access_logs` ADD CONSTRAINT `patient_share_access_logs_attachment_id_fkey` FOREIGN KEY (`attachment_id`) REFERENCES `attachments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;