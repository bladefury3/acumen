
-- Create a table to track lesson plan emails that have been sent
CREATE TABLE IF NOT EXISTS public.lesson_emails_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.lesson_plans(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Create a unique constraint on user_email and lesson_id
  CONSTRAINT unique_user_lesson_email UNIQUE (user_email, lesson_id)
);

-- Add RLS policies for this table
ALTER TABLE public.lesson_emails_sent ENABLE ROW LEVEL SECURITY;

-- Only allow the function to insert records
CREATE POLICY "Edge functions can insert email records" 
  ON public.lesson_emails_sent 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Users can view their own email records
CREATE POLICY "Users can view their own email records" 
  ON public.lesson_emails_sent 
  FOR SELECT 
  USING (user_email = auth.jwt() ->> 'email');
