-- Create a table for temporary user accounts with 30-day expiry
CREATE TABLE public.temp_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by_admin BOOLEAN NOT NULL DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE public.temp_users ENABLE ROW LEVEL SECURITY;

-- Create policy for temp users to view their own data
CREATE POLICY "Users can view their own account" 
ON public.temp_users 
FOR SELECT 
USING (true);

-- Create function to check if account is still valid
CREATE OR REPLACE FUNCTION public.is_account_valid(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.temp_users 
    WHERE id = user_id 
    AND is_active = true 
    AND expires_at > now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get days remaining
CREATE OR REPLACE FUNCTION public.get_days_remaining(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  days_left INTEGER;
BEGIN
  SELECT EXTRACT(DAY FROM (expires_at - now()))::INTEGER
  INTO days_left
  FROM public.temp_users 
  WHERE id = user_id 
  AND is_active = true 
  AND expires_at > now();
  
  RETURN COALESCE(days_left, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;