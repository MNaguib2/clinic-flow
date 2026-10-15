/*
  Warnings:

  - You are about to drop the column `description` on the `permissions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `expenses` MODIFY `expense_date` DATE NOT NULL DEFAULT (CURRENT_DATE);

-- AlterTable
ALTER TABLE `permissions` DROP COLUMN `description`,
    ADD COLUMN `description_ar` TEXT NULL,
    ADD COLUMN `description_en` TEXT NULL;
