-- Create bilingual permission pages.
CREATE TABLE `pages` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `description_en` TEXT NOT NULL,
    `description_ar` TEXT NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    UNIQUE INDEX `pages_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Existing permissions are grouped by the first segment of their dotted name.
INSERT INTO `pages` (`name`, `description_en`, `description_ar`)
SELECT DISTINCT
    SUBSTRING_INDEX(`name`, '.', 1),
    CONCAT('Permissions and records for ', SUBSTRING_INDEX(`name`, '.', 1), '.'),
    CONCAT('صلاحيات وسجلات صفحة ', SUBSTRING_INDEX(`name`, '.', 1), '.')
FROM `permissions`;

ALTER TABLE `permissions` ADD COLUMN `page_id` BIGINT NULL;

UPDATE `permissions` AS permission
JOIN `pages` AS page
    ON page.`name` = SUBSTRING_INDEX(permission.`name`, '.', 1)
SET permission.`page_id` = page.`id`;

ALTER TABLE `permissions` MODIFY `page_id` BIGINT NOT NULL;
CREATE INDEX `permissions_page_id_idx` ON `permissions`(`page_id`);

ALTER TABLE `permissions`
    ADD CONSTRAINT `permissions_page_id_fkey`
    FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;