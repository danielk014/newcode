
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'en',
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create saved scripts table
CREATE TABLE public.saved_scripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  industry TEXT,
  language TEXT DEFAULT 'en',
  word_count INTEGER,
  sentiment_score JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create industry templates table
CREATE TABLE public.industry_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  industry TEXT NOT NULL,
  template_content TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- RLS policies for saved scripts
CREATE POLICY "Users can view their own scripts" 
  ON public.saved_scripts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scripts" 
  ON public.saved_scripts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scripts" 
  ON public.saved_scripts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scripts" 
  ON public.saved_scripts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for industry templates (public read access)
CREATE POLICY "Everyone can view active templates" 
  ON public.industry_templates 
  FOR SELECT 
  USING (is_active = true);

-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('script-files', 'script-files', false);

-- Storage policies
CREATE POLICY "Users can upload their own files" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'script-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'script-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some industry templates
INSERT INTO public.industry_templates (title, industry, template_content, description, tags) VALUES
('Fitness Transformation Hook', 'fitness', 'Stop scrolling! What I''m about to show you will transform your body in just 30 days without spending hours in the gym. But first, let me tell you why everything you''ve been told about fitness is wrong...', 'High-converting fitness hook focusing on transformation and debunking myths', ARRAY['transformation', 'hook', 'fitness']),
('Business Success Formula', 'business', 'If you''re struggling to scale your business past 6 figures, this video will change everything. I''m going to reveal the exact system that took my company from $0 to $1M in revenue...', 'Proven business growth template with specific numbers and results', ARRAY['business', 'scaling', 'revenue']),
('Educational Deep Dive', 'education', 'Today I''m going to teach you [TOPIC] in the simplest way possible. By the end of this video, you''ll understand what took me years to figure out...', 'Educational content template that promises simplified learning', ARRAY['education', 'teaching', 'learning']),
('Tech Product Launch', 'technology', 'This new [PRODUCT/TECHNOLOGY] is about to disrupt everything. Here''s why industry leaders are calling it the next big breakthrough...', 'Technology announcement and review template', ARRAY['technology', 'product', 'innovation']);
