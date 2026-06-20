-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CONSTRAINT chk_role CHECK (role IN ('user', 'client', 'admin')),
    status TEXT NOT NULL DEFAULT 'active' CONSTRAINT chk_status CHECK (status IN ('active', 'rejected', 'banned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories - Public Read" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Categories - Admin All Access" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 3. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notifications - Select Own" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Notifications - Update Own" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Notifications - Insert Policy" ON public.notifications
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- 4. SESSION TYPES TABLE
CREATE TABLE IF NOT EXISTS public.session_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60 CONSTRAINT positive_duration CHECK (duration_minutes > 0),
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CONSTRAINT positive_price CHECK (price >= 0),
    max_slots INTEGER NOT NULL DEFAULT 1 CONSTRAINT positive_slots CHECK (max_slots > 0),
    location TEXT NOT NULL DEFAULT 'On Premises',
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.session_types ENABLE ROW LEVEL SECURITY;

-- 3. SESSIONS TABLE (Scheduled Instances)
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_type_id UUID NOT NULL REFERENCES public.session_types(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    max_slots INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CONSTRAINT chk_session_status CHECK (status IN ('scheduled', 'cancelled', 'completed')),
    cancel_reason TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT chk_time_order CHECK (start_time < end_time)
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- 4. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CONSTRAINT chk_booking_status CHECK (status IN ('pending', 'confirmed', 'cancelled', 'no_show', 'completed')),
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CONSTRAINT chk_payment_status CHECK (payment_status IN ('unpaid', 'paid')),
    cancel_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_session_booking UNIQUE (user_id, session_id)
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 5. LOGIN HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    ip_address TEXT,
    user_agent TEXT
);

ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

-- 6. SESSION HISTORY TABLE (Audit Trail)
CREATE TABLE IF NOT EXISTS public.session_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    action TEXT NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    previous_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.session_history ENABLE ROW LEVEL SECURITY;

-- 7. BOOKINGS HISTORY TABLE (Audit Trail)
CREATE TABLE IF NOT EXISTS public.bookings_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL,
    action TEXT NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    previous_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.bookings_history ENABLE ROW LEVEL SECURITY;

-- 8. AVAILABILITY RULES (Weekly shifts)
CREATE TABLE IF NOT EXISTS public.availability_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_week INTEGER NOT NULL CONSTRAINT chk_day CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT chk_rule_times CHECK (start_time < end_time)
);

ALTER TABLE public.availability_rules ENABLE ROW LEVEL SECURITY;

-- 9. AVAILABILITY EXCEPTIONS (Block-out dates/ranges)
CREATE TABLE IF NOT EXISTS public.availability_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exception_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_blocked BOOLEAN NOT NULL DEFAULT true,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT chk_exception_times CHECK (start_time IS NULL OR end_time IS NULL OR start_time < end_time)
);

ALTER TABLE public.availability_exceptions ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- DATABASE FUNCTIONS & TRIGGERS
-- ==========================================

-- A. Auto Sync Auth User to Public Profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    'user',
    'active'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- B. First Booking Role Transition (User -> Client)
CREATE OR REPLACE FUNCTION public.handle_booking_role_transition()
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles
  SET role = 'client',
      updated_at = timezone('utc'::text, now())
  WHERE id = new.user_id AND role = 'user';
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_booking_inserted
  AFTER INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_booking_role_transition();

-- C. Auto-update Updated At Column Function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = timezone('utc'::text, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_session_types_updated_at
  BEFORE UPDATE ON public.session_types
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Helper function to check if active admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is not banned/rejected
CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES POLICIES
CREATE POLICY "Profiles - Select Self" ON public.profiles
  FOR SELECT USING (auth.uid() = id AND status = 'active');

CREATE POLICY "Profiles - Admin Access All" ON public.profiles
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Profiles - Update Self" ON public.profiles
  FOR UPDATE USING (auth.uid() = id AND status = 'active')
  WITH CHECK (auth.uid() = id AND status = 'active');

-- SESSION_TYPES POLICIES
CREATE POLICY "Session Types - Active Users View" ON public.session_types
  FOR SELECT USING (public.is_active_user() AND is_active = true);

CREATE POLICY "Session Types - Admin Management" ON public.session_types
  TO authenticated
  USING (public.is_admin());

-- SESSIONS POLICIES
CREATE POLICY "Sessions - Active Users View" ON public.sessions
  FOR SELECT USING (public.is_active_user() AND status != 'cancelled');

CREATE POLICY "Sessions - Admin Management" ON public.sessions
  TO authenticated
  USING (public.is_admin());

-- BOOKINGS POLICIES
CREATE POLICY "Bookings - User View Self" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id AND public.is_active_user());

CREATE POLICY "Bookings - User Create Self" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_active_user());

CREATE POLICY "Bookings - User Update Self" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id AND public.is_active_user())
  WITH CHECK (auth.uid() = user_id AND public.is_active_user());

CREATE POLICY "Bookings - Admin Management" ON public.bookings
  TO authenticated
  USING (public.is_admin());

-- LOGIN_HISTORY POLICIES
CREATE POLICY "Login History - User View Self" ON public.login_history
  FOR SELECT USING (auth.uid() = user_id AND public.is_active_user());

CREATE POLICY "Login History - Admin Access All" ON public.login_history
  TO authenticated
  USING (public.is_admin());

-- SESSION_HISTORY POLICIES
CREATE POLICY "Session History - Admin Access All" ON public.session_history
  TO authenticated
  USING (public.is_admin());

-- BOOKINGS_HISTORY POLICIES
CREATE POLICY "Bookings History - Admin Access All" ON public.bookings_history
  TO authenticated
  USING (public.is_admin());

-- AVAILABILITY_RULES POLICIES
CREATE POLICY "Availability Rules - Active Users View" ON public.availability_rules
  FOR SELECT USING (public.is_active_user() AND is_active = true);

CREATE POLICY "Availability Rules - Admin Management" ON public.availability_rules
  TO authenticated
  USING (public.is_admin());

-- AVAILABILITY_EXCEPTIONS POLICIES
CREATE POLICY "Availability Exceptions - Active Users View" ON public.availability_exceptions
  FOR SELECT USING (public.is_active_user());

CREATE POLICY "Availability Exceptions - Admin Management" ON public.availability_exceptions
  TO authenticated
  USING (public.is_admin());

-- ==========================================
-- STORAGE BUCKETS & POLICIES
-- ==========================================

-- session_images bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('session_images', 'session_images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Session Images Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'session_images');

CREATE POLICY "Session Images Admin Insert" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'session_images' AND public.is_admin()
);

CREATE POLICY "Session Images Admin Update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'session_images' AND public.is_admin()
);

CREATE POLICY "Session Images Admin Delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'session_images' AND public.is_admin()
);
