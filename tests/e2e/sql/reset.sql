DO $$
DECLARE
    table_list TEXT;
BEGIN
    -- Gather all tables in public schema into a comma-separated list, excluding tables with predefined rows
    SELECT string_agg(quote_ident(tablename), ', ')
    INTO table_list
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT IN (
          'category',
          'medium',
          'feed_flag_status',
          'channel_itunes_type',
          'item_itunes_episode_type',
          'live_item_status',
          'sharable_status',
          'account_membership'
      );

    -- Disable foreign key constraints temporarily
    EXECUTE 'SET session_replication_role = replica';

    -- Truncate all tables in one go, reset IDs, cascade dependencies
    EXECUTE 'TRUNCATE TABLE ' || table_list || ' RESTART IDENTITY CASCADE';

    -- Re-enable constraints
    EXECUTE 'SET session_replication_role = DEFAULT';
END $$;