BEGIN;
CREATE SEQUENCE episodes_int_id_seq;
ALTER TABLE episodes ADD COLUMN int_id bigint;
ALTER TABLE episodes
    ALTER COLUMN int_id SET DEFAULT nextval('episodes_int_id_seq'),
    ADD CONSTRAINT chk CHECK (int_id IS NOT NULL) NOT VALID;
ALTER SEQUENCE episodes_int_id_seq OWNED BY episodes.int_id;
COMMIT;

/*
  NOTE: the int_id columns exist mainly so that the Manticore index jobs have
  a reliable numeric identifier for selecting ~10000 rows at a time as part
  of the index operation.
*/

CREATE UNIQUE INDEX CONCURRENTLY episodes_int_id_key ON episodes (int_id);

-- Use a script to report the UPDATE and VACUUM commands until not episodes with int_ids are left
-- NOTE: USE THE 0028_episodes_ids.ts SCRIPT FOR THESE STEPS.
-- UPDATE episodes SET int_id = nextval('episodes_id_seq') WHERE id IN (SELECT id FROM episodes WHERE int_id IS NULL LIMIT 1000);
-- VACUUM has to be run separately after each UPDATE transaction.
-- VACUUM episodes;

-- After all episodes have a unique int_id, then run the following
-- to change it to a unique serial column.
ALTER TABLE episodes VALIDATE CONSTRAINT chk;
ALTER TABLE episodes
    ALTER COLUMN int_id SET NOT NULL,
    ADD UNIQUE USING INDEX episodes_int_id_key;
