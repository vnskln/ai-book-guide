-- Disable RLS for all tables in public schema
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY;', table_record.tablename);
        RAISE NOTICE 'Disabled RLS on table: %', table_record.tablename;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

---- ROLLBACK ----
/*
-- Re-enable RLS for all tables in public schema if needed
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', table_record.tablename);
        RAISE NOTICE 'Enabled RLS on table: %', table_record.tablename;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
*/ 