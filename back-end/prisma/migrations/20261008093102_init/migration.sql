/*
  Warnings:

  - Added the required column `organizationId` to the `specialties` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `expenses` MODIFY `expense_date` DATE NOT NULL DEFAULT (CURRENT_DATE);

-- AlterTable
ALTER TABLE `specialties` ADD COLUMN `organizationId` BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE `specialties` ADD CONSTRAINT `specialties_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
