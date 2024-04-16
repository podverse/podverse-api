CREATE TYPE flag_status AS ENUM ('none', 'spam', 'takedown', 'other');

ALTER TABLE podcasts
ADD COLUMN flag_status flag_status DEFAULT 'none';
