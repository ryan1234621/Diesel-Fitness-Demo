# Authentication and Profiles

This document outlines the authentication strategy, user profiles, and role-based access control for Diesel Fitness.

## 1. Authentication Strategy
We use **Supabase Auth** for handling secure user registration, login, and session management. 
- **Sign Up:** Users register with an email and password. Their first and last name are passed via `user_metadata`.
- **Sign In:** Users authenticate with email and password.

## 2. Profiles Table Sync
We maintain a `public.profiles` table to store application-specific user data. This table is kept in sync with the `auth.users` table using a Supabase PostgreSQL Trigger:
- When a user signs up, the `handle_new_user()` trigger automatically inserts a row into `public.profiles`.
- The default role assigned to new signups is `'user'`.

## 3. Role-Based Access Control (RBAC)
The application defines multiple user roles to restrict access to different features and pages:

### Roles
- **`user`**: The default role for newly signed-up individuals. They can browse the app and book sessions.
- **`client`**: Once a `user` makes their first booking, a trigger (`handle_booking_role_transition`) promotes their role to `client`.
- **`admin`**: Application administrators. They have full access to manage sessions, bookings, availability, and view all users. Admin roles must be manually assigned directly in the Supabase Dashboard.
- **`banned`**: Users whose access has been revoked. They are redirected to a restricted area and cannot interact with the system.

### Route Protection
The Next.js application enforces access using `AuthContext`:
- **`/login` & `/signup`**: Accessible to unauthenticated users.
- **`/admin/*`**: Restricted to users with the `admin` role.
- **`/client/*`**: Accessible to `user` and `client` roles.
- **`/banned`**: Restricted to users with the `banned` status.

## 4. Row Level Security (RLS)
The database enforces RLS policies to ensure data privacy:
- Users can only `SELECT` and `UPDATE` their own profile.
- Users can only view their own bookings.
- Admins bypass restrictions and have full access to all tables.
