-- AlterTable
ALTER TABLE `expenses` MODIFY `expense_date` DATE NOT NULL DEFAULT (CURRENT_DATE);

-- AlterTable
ALTER TABLE `users` ADD COLUMN `certifications` JSON NULL,
    ADD COLUMN `current_working_experiences` JSON NULL,
    ADD COLUMN `job_title` VARCHAR(100) NULL,
    ADD COLUMN `portfolio_url` TEXT NULL,
    ADD COLUMN `previous_working_experiences` JSON NULL;
