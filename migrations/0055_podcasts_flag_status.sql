CREATE TYPE flag_status_enum AS ENUM ('none', 'spam', 'takedown', 'other', 'always-allow');

ALTER TABLE podcasts
ADD COLUMN flag_status flag_status_enum DEFAULT 'none';
