ALTER TABLE public.companies DROP COLUMN IF EXISTS new_name_test;
ALTER TABLE public.companies ADD COLUMN new_name_test TEXT NULL;