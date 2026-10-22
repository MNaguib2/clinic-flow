CREATE TABLE `global_specialties` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(100) NOT NULL,
    `name_en` VARCHAR(150) NOT NULL,
    `name_ar` VARCHAR(150) NOT NULL,
    `description_en` TEXT NOT NULL,
    `description_ar` TEXT NOT NULL,
    `image_url` TEXT NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    UNIQUE INDEX `global_specialties_code_key` (`code`),
    INDEX `global_specialties_is_active_sort_order_idx` (`is_active`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;