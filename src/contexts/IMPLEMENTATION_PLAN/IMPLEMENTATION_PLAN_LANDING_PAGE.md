# Implementation Plan - Landing Page Weekly Schedule

This document outlines the approach for adding a dynamic weekly schedule section to the public landing page, displaying upcoming sessions straight from the database.

## Objective
Display upcoming active sessions on the public landing page using a sleek, interactive horizontal weekly calendar with glassmorphic cards, and route users appropriately when they attempt to book a session.

## User Review Required

> [!WARNING]
> **Data Privacy / Public Access**
> Currently, our Supabase Row Level Security (RLS) policies strict access to `sessions` and `session_types` to active, logged-in users. To display the schedule on the landing page, we MUST modify the RLS policies to allow **Public Read Access**. This means anyone on the internet can see the scheduled classes, their times, prices, and locations. 

---

## Proposed Changes

### 1. Database Migrations (RLS Policies)

#### [NEW] [supabase/migrations/xxxx_public_sessions_read.sql](file:///Users/ryan/Diesel%20Fitness%20Demo/supabase/migrations)
We will create a new Supabase migration file to update the `sessions` and `session_types` tables:
- **`sessions`**: Add a policy `Sessions - Public View` that allows `SELECT` for `PUBLIC` where `status = 'scheduled'`.
- **`session_types`**: Add a policy `Session Types - Public View` that allows `SELECT` for `PUBLIC` where `is_active = true`.

#### [MODIFY] [schema.sql](file:///Users/ryan/Diesel%20Fitness%20Demo/schema.sql)
We will update the master schema file to reflect these new public policies for consistency.

---

### 2. UI Components

#### [NEW] [src/components/landing/WeeklySchedule.tsx](file:///Users/ryan/Diesel%20Fitness%20Demo/src/components/landing/WeeklySchedule.tsx)
We will create a new component specifically for the landing page schedule:
- **Data Fetching**: Fetch the next 14 days of sessions from `sessions` and `session_types` where `start_time >= now()`.
- **Date Selector**: A horizontal scrollable list of upcoming dates. Clicking a date filters the sessions.
- **Session Cards**: Glassmorphic UI cards showing the session title, time, duration, price, and location.
- **Capacity Indicator**: Show available spots remaining (optional, depending on preference).
- **Booking CTA**: A "Book Now" button on each session card.

---

### 3. Landing Page Integration

#### [MODIFY] [src/app/page.tsx](file:///Users/ryan/Diesel%20Fitness%20Demo/src/app/page.tsx)
- Import and render the `<WeeklySchedule />` component right below the Hero Section or Features Grid.
- Adjust vertical spacing to ensure a smooth, premium scrolling experience.

---

### 4. Booking Redirection Flow

The `<WeeklySchedule />` will utilize the existing `useAuth()` context to determine the CTA behavior:
- **Unauthenticated**: The "Book Now" button will link to `/login` with an informational toast.
- **Authenticated (Client/User)**: The "Book Now" button will link directly to `/dashboard/bookings/new`.
- **Authenticated (Admin)**: The "Book Now" button will be disabled or link to the admin schedule management.

---

## Verification Plan

### Automated Tests
- Run `npm run build` to ensure the new component compiles without TypeScript errors.

### Manual Verification
1. Open the landing page (`/`) in an **incognito window** (unauthenticated). Verify the schedule loads correctly and does not throw RLS errors.
2. Click "Book Now" as a guest and verify it redirects to the login/signup page.
3. Log in as a client and verify "Book Now" takes you to the booking flow.
