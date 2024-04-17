CREATE TYPE flag_status AS ENUM ('none', 'spam', 'takedown', 'other', 'always-allow');

ALTER TABLE podcasts
ADD COLUMN flag_status flag_status DEFAULT 'none';
