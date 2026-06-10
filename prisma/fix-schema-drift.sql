-- Auto-fix schema drift: only resets if User table is missing required columns
-- This runs conditionally - safe to run on every deploy
DO $$
BEGIN
  -- Check if User table has the email column (indicates correct schema)
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'email'
  ) THEN
    RAISE NOTICE 'Schema drift detected: User.email column missing. Resetting schema...';

    -- Drop all tables and recreate schema fresh
    -- This also removes _prisma_migrations so migrate deploy will re-apply all migrations
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
    GRANT ALL ON SCHEMA public TO postgres;
    GRANT ALL ON SCHEMA public TO public;

    RAISE NOTICE 'Schema reset complete. Migrations will be applied fresh.';
  ELSE
    RAISE NOTICE 'Schema OK: no drift detected.';
  END IF;
END
$$;
