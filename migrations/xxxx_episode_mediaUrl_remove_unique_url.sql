-- Remove the unique constraint from episodes.mediaUrl

ALTER TABLE episodes DROP CONSTRAINT "UQ_da6fc438d37c65927437b3107f0";
