-- Auto-fix schema drift: only resets if User table is missing required columns
-- Drops individual tables instead of schema to avoid permission issues
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Check if User table has the email column (indicates correct schema)
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'email'
  ) THEN
    RAISE NOTICE 'Schema drift detected. Dropping all tables...';

    -- Drop each table individually (including _prisma_migrations)
    -- so migrate deploy will re-apply all migrations fresh
    FOR r IN
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
      EXECUTE 'DROP TABLE IF EXISTS "' || r.tablename || '" CASCADE';
      RAISE NOTICE 'Dropped table: %', r.tablename;
    END LOOP;

    RAISE NOTICE 'All tables dropped. Migrations will be applied fresh.';
  ELSE
    RAISE NOTICE 'Schema OK: no drift detected, skipping reset.';
  END IF;
END
$$;


