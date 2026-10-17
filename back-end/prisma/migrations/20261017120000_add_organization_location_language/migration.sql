-- AlterTable
ALTER TABLE `organization_settings`
    ADD COLUMN `country` VARCHAR(100) NULL,
    ADD COLUMN `city` VARCHAR(100) NULL,
    ADD COLUMN `language` VARCHAR(10) NOT NULL DEFAULT 'en';
