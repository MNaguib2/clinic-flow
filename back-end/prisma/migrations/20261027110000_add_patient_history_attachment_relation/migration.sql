-- AlterTable
ALTER TABLE `attachments` ADD COLUMN `patient_history_item_id` BIGINT NULL;

-- CreateIndex
CREATE INDEX `attachments_patient_history_item_id_idx` ON `attachments`(`patient_history_item_id`);

-- AddForeignKey
ALTER TABLE `attachments` ADD CONSTRAINT `attachments_patient_history_item_id_fkey` FOREIGN KEY (`patient_history_item_id`) REFERENCES `patient_history_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;