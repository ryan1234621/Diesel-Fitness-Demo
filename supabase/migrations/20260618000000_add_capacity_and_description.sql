-- Migration to add capacity to session_types and description to sessions
ALTER TABLE public.session_types ADD COLUMN capacity INTEGER DEFAULT NULL;
ALTER TABLE public.sessions ADD COLUMN description TEXT DEFAULT NULL;
