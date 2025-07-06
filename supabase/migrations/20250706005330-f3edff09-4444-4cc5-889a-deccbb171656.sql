-- Remove the old foreign key constraint that references auth.users
-- This constraint is conflicting with the temp_users system
ALTER TABLE public.saved_scripts 
DROP CONSTRAINT saved_scripts_user_id_fkey;