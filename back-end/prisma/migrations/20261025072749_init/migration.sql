-- AlterTable
ALTER TABLE `expenses` MODIFY `expense_date` DATE NOT NULL DEFAULT (CURRENT_DATE);

-- AlterTable
ALTER TABLE `user_roles` ADD COLUMN `clinic_id` BIGINT NULL;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_clinic_id_fkey` FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
