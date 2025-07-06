-- Fix RLS policies for temp_users to allow INSERT operations
-- Drop the existing policy and create proper ones
DROP POLICY IF EXISTS "Users can view their own account" ON public.temp_users;

-- Create policy to allow anyone to view temp user data (for login)
CREATE POLICY "Allow reading temp users for login" 
ON public.temp_users 
FOR SELECT 
USING (true);

-- Create policy to allow INSERT operations (for admin creating users)
CREATE POLICY "Allow creating temp users" 
ON public.temp_users 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow UPDATE operations  
CREATE POLICY "Allow updating temp users" 
ON public.temp_users 
FOR UPDATE 
USING (true);

-- Create policy to allow DELETE operations
CREATE POLICY "Allow deleting temp users" 
ON public.temp_users 
FOR DELETE 
USING (true);