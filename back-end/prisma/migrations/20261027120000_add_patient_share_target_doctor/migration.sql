-- AlterTable
ALTER TABLE `patient_shares` ADD COLUMN `target_doctor_id` BIGINT NULL;

-- CreateIndex
CREATE INDEX `patient_shares_to_organization_id_target_doctor_id_idx` ON `patient_shares`(`to_organization_id`, `target_doctor_id`);

-- AddForeignKey
ALTER TABLE `patient_shares` ADD CONSTRAINT `patient_shares_target_doctor_id_fkey` FOREIGN KEY (`to_organization_id`, `target_doctor_id`) REFERENCES `users`(`organization_id`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;