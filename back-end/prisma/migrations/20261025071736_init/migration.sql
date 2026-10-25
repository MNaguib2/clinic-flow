/*
  Warnings:

  - You are about to drop the column `clinic_id` on the `user_roles` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `user_roles` DROP FOREIGN KEY `user_roles_clinic_id_fkey`;

-- DropIndex
DROP INDEX `user_roles_clinic_id_fkey` ON `user_roles`;

-- AlterTable
ALTER TABLE `expenses` MODIFY `expense_date` DATE NOT NULL DEFAULT (CURRENT_DATE);

-- AlterTable
ALTER TABLE `user_roles` DROP COLUMN `clinic_id`;
