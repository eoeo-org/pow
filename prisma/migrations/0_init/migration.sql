-- CreateTable
CREATE TABLE `connectionStates` (
    `voiceChannel` BIGINT UNSIGNED NOT NULL,
    `guild` BIGINT UNSIGNED NOT NULL,
    `readChannel` BIGINT UNSIGNED NOT NULL,
    `skipUser` TEXT NULL,

    PRIMARY KEY (`voiceChannel` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userSetting` (
    `id` BIGINT NOT NULL DEFAULT 0,
    `speaker` VARCHAR(20) NOT NULL DEFAULT '',
    `pitch` INTEGER UNSIGNED NOT NULL,
    `speed` INTEGER UNSIGNED NOT NULL,
    `isDontRead` TINYINT NOT NULL DEFAULT 0,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

