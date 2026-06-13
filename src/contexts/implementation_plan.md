# Implementation Plan - Supabase Auth & Role-Based Routing

This document outlines the revised approach for the Diesel Fitness application. We will prioritize setting up the backend structure, authentication, and role-based routing before building out the complex dashboard features.

---

## Goal Description

We will initialize the Supabase database with our predefined schema, implement functional Login and Signup pages using Next.js and Supabase Auth, and create mockup Admin and Client dashboards to verify role-based access control.

## User Review Required

> [!IMPORTANT]  
> **Admin Creation**: As requested, we will rely on you manually updating a user's role to `'admin'` directly within the Supabase Dashboard once the tables and a test user are created. 

## Proposed Changes

### 1. Database Setup
#### [EXECUTE] `schema.sql`
Run the SQL schema script against the Supabase project to:
- Create all core tables (`profiles`, `sessions`, `bookings`, etc.).
- Establish Row Level Security (RLS) policies.
- **Set up robust database triggers:** Establish an error-safeguarded trigger that automatically syncs newly registered `auth.users` to the `public.profiles` table with a default `'user'` role using explicit type casting to prevent database creation crashes.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url, role)
  VALUES (
    NEW.id,
    'New',
    'User',
    NULL,
    'user'::user_role
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW; 
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();