/*
  Warnings:

  - The primary key for the `userSetting` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `userSetting` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `UnsignedBigInt`.
  - You are about to alter the column `speaker` on the `userSetting` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `Enum(EnumId(0))`.
  - Made the column `skipUser` on table `connectionstates` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `connectionStates` MODIFY `skipUser` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `userSetting` DROP PRIMARY KEY,
    MODIFY `id` BIGINT UNSIGNED NOT NULL,
    MODIFY `speaker` ENUM('show', 'haruka', 'hikari', 'takeru', 'santa', 'bear') NOT NULL,
    MODIFY `isDontRead` BOOLEAN NOT NULL DEFAULT false,
    ADD PRIMARY KEY (`id`);
