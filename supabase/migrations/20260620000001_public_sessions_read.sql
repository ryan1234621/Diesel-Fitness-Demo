-- Migration to add public read access to sessions and session_types for the landing page

-- 1. Session Types: Public Read
CREATE POLICY "Session Types - Public View" ON public.session_types
  FOR SELECT
  USING (is_active = true);

-- 2. Sessions: Public Read
CREATE POLICY "Sessions - Public View" ON public.sessions
  FOR SELECT
  USING (status = 'scheduled');
