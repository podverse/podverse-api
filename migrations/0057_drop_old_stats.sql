-- 
-- NOTE: THIS MUST ONLY BE RUN AFTER THE NEW API IS DEPLOYED.
--

-- Drop the podcasts stats indexes

DO $$
DECLARE
    index_name TEXT;
BEGIN
    FOR index_name IN
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'podcasts'
          AND (
            indexdef ILIKE '%pastHourTotalUniquePageviews%'
            OR indexdef ILIKE '%pastDayTotalUniquePageviews%'
            OR indexdef ILIKE '%pastWeekTotalUniquePageviews%'
            OR indexdef ILIKE '%pastMonthTotalUniquePageviews%'
            OR indexdef ILIKE '%pastYearTotalUniquePageviews%'
            OR indexdef ILIKE '%pastAllTimeTotalUniquePageviews%'
          )
    LOOP
        EXECUTE format('DROP INDEX IF EXISTS %I;', index_name);
    END LOOP;
END $$;

-- Drop the episodes stats indexes

DO $$
DECLARE
    index_name TEXT;
BEGIN
    FOR index_name IN
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'episodes'
          AND (
            indexdef ILIKE '%pastHourTotalUniquePageviews%'
            OR indexdef ILIKE '%pastDayTotalUniquePageviews%'
            OR indexdef ILIKE '%pastWeekTotalUniquePageviews%'
            OR indexdef ILIKE '%pastMonthTotalUniquePageviews%'
            OR indexdef ILIKE '%pastYearTotalUniquePageviews%'
            OR indexdef ILIKE '%pastAllTimeTotalUniquePageviews%'
          )
    LOOP
        EXECUTE format('DROP INDEX IF EXISTS %I;', index_name);
    END LOOP;
END $$;

-- Drop the mediaRefs stats indexes

DO $$
DECLARE
    index_name TEXT;
BEGIN
    FOR index_name IN
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'mediaRefs'
          AND (
            indexdef ILIKE '%pastHourTotalUniquePageviews%'
            OR indexdef ILIKE '%pastDayTotalUniquePageviews%'
            OR indexdef ILIKE '%pastWeekTotalUniquePageviews%'
            OR indexdef ILIKE '%pastMonthTotalUniquePageviews%'
            OR indexdef ILIKE '%pastYearTotalUniquePageviews%'
            OR indexdef ILIKE '%pastAllTimeTotalUniquePageviews%'
          )
    LOOP
        EXECUTE format('DROP INDEX IF EXISTS %I;', index_name);
    END LOOP;
END $$;

-- Drop old podcast stats columns

ALTER TABLE podcasts
DROP COLUMN "pastHourTotalUniquePageviews";

ALTER TABLE podcasts
DROP COLUMN "pastDayTotalUniquePageviews";

ALTER TABLE podcasts
DROP COLUMN "pastWeekTotalUniquePageviews";

ALTER TABLE podcasts
DROP COLUMN "pastMonthTotalUniquePageviews";

ALTER TABLE podcasts
DROP COLUMN "pastYearTotalUniquePageviews";

ALTER TABLE podcasts
DROP COLUMN "pastAllTimeTotalUniquePageviews";

-- Drop old episode stats columns
-- First drop the dependent materialized view

DROP MATERIALIZED VIEW "episodes_most_recent";

ALTER TABLE episodes
DROP COLUMN "pastHourTotalUniquePageviews";

ALTER TABLE episodes
DROP COLUMN "pastDayTotalUniquePageviews";

ALTER TABLE episodes
DROP COLUMN "pastWeekTotalUniquePageviews";

ALTER TABLE episodes
DROP COLUMN "pastMonthTotalUniquePageviews";

ALTER TABLE episodes
DROP COLUMN "pastYearTotalUniquePageviews";

ALTER TABLE episodes
DROP COLUMN "pastAllTimeTotalUniquePageviews";

-- Drop old mediaRefs stats columns

ALTER TABLE "mediaRefs"
DROP COLUMN "pastHourTotalUniquePageviews";

ALTER TABLE "mediaRefs"
DROP COLUMN "pastDayTotalUniquePageviews";

ALTER TABLE "mediaRefs"
DROP COLUMN "pastWeekTotalUniquePageviews";

ALTER TABLE "mediaRefs"
DROP COLUMN "pastMonthTotalUniquePageviews";

ALTER TABLE "mediaRefs"
DROP COLUMN "pastYearTotalUniquePageviews";

ALTER TABLE "mediaRefs"
DROP COLUMN "pastAllTimeTotalUniquePageviews";
