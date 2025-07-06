-- Update saved_scripts table to work with temp_users
-- First, drop the existing RLS policies
DROP POLICY IF EXISTS "Users can create their own scripts" ON public.saved_scripts;
DROP POLICY IF EXISTS "Users can delete their own scripts" ON public.saved_scripts;
DROP POLICY IF EXISTS "Users can update their own scripts" ON public.saved_scripts;
DROP POLICY IF EXISTS "Users can view their own scripts" ON public.saved_scripts;

-- Add foreign key constraint to temp_users
ALTER TABLE public.saved_scripts 
ADD CONSTRAINT fk_saved_scripts_temp_user 
FOREIGN KEY (user_id) REFERENCES public.temp_users(id) ON DELETE CASCADE;

-- Create new RLS policies for temp users
CREATE POLICY "Temp users can create their own scripts" 
ON public.saved_scripts 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM public.temp_users WHERE id = user_id));

CREATE POLICY "Temp users can view their own scripts" 
ON public.saved_scripts 
FOR SELECT 
USING (user_id IN (SELECT id FROM public.temp_users WHERE id = user_id));

CREATE POLICY "Temp users can update their own scripts" 
ON public.saved_scripts 
FOR UPDATE 
USING (user_id IN (SELECT id FROM public.temp_users WHERE id = user_id));

CREATE POLICY "Temp users can delete their own scripts" 
ON public.saved_scripts 
FOR DELETE 
USING (user_id IN (SELECT id FROM public.temp_users WHERE id = user_id));