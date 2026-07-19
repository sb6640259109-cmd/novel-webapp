-- Revert the temporary publication-status feature without deleting novel rows.
ALTER TABLE `Novel` DROP COLUMN `status`;
