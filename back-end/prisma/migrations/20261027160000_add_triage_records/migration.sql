-- CreateIndex
CREATE UNIQUE INDEX `appointments_organization_id_id_key` ON `appointments`(`organization_id`, `id`);

-- CreateTable
CREATE TABLE `triage_records` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `organization_id` BIGINT NOT NULL,
    `appointment_id` BIGINT NOT NULL,
    `recorded_by_user_id` BIGINT NOT NULL,
    `recorded_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `reason_for_visit` TEXT NULL,
    `symptoms` TEXT NULL,
    `symptom_duration` VARCHAR(100) NULL,
    `blood_pressure_systolic` SMALLINT NULL,
    `blood_pressure_diastolic` SMALLINT NULL,
    `pulse_rate` SMALLINT NULL,
    `temperature_c` DECIMAL(4, 1) NULL,
    `respiratory_rate` SMALLINT NULL,
    `oxygen_saturation` DECIMAL(5, 2) NULL,
    `weight_kg` DECIMAL(6, 2) NULL,
    `height_cm` DECIMAL(5, 2) NULL,
    `priority` ENUM('ROUTINE', 'URGENT', 'EMERGENCY') NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `triage_records_organization_id_appointment_id_recorded_at_idx`(`organization_id`, `appointment_id`, `recorded_at`),
    INDEX `triage_records_organization_id_recorded_by_user_id_idx`(`organization_id`, `recorded_by_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `triage_records` ADD CONSTRAINT `triage_records_appointment_fkey` FOREIGN KEY (`organization_id`, `appointment_id`) REFERENCES `appointments`(`organization_id`, `id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `triage_records` ADD CONSTRAINT `triage_records_recorded_by_fkey` FOREIGN KEY (`organization_id`, `recorded_by_user_id`) REFERENCES `users`(`organization_id`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;