-- ---------------------------------------------------------------------------
-- 🧹 CLEANUP SCRIPT (FULL RESET)
-- ---------------------------------------------------------------------------

DROP TABLE IF EXISTS public.trends CASCADE; -- NEW
DROP TABLE IF EXISTS public.system_logs CASCADE;
DROP TABLE IF EXISTS public.comparisons CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
