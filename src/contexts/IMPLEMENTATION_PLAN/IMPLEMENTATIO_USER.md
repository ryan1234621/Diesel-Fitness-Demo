# Implementation Plan - Client Dashboard & Payments (IMPLEMENTATIO_USER.md)

This plan outlines the approach to upgrade the client dashboard (`/dashboard`) to fetch real database metrics, manage client-side bookings, calculate in-person payment stats, and integrate the notifications center.

---

## User Review Required

> [!IMPORTANT]
> **In-Person Payments Tracking**:
> - We will calculate total payments made by summing the `sessions.price` of bookings where `bookings.payment_status = 'paid'`.
> - This represents in-person payment collections recorded by the trainer on behalf of this client.

---

## Proposed Changes

### 1. Client Dashboard Logic (`src/app/dashboard/page.tsx`)

#### [MODIFY] [page.tsx](file:///Users/ryan/Diesel%20Fitness%20Demo/src/app/dashboard/page.tsx)
- **Data Fetching**:
  - Fetch all bookings for the authenticated client (`bookings.user_id = auth.uid()`), selecting nested session information (`sessions(*, session_types(title))`).
  - Fetch unread notifications for the client from `public.notifications`.
- **Live Metrics**:
  - **Upcoming**: Count bookings where `status` is `pending` or `confirmed` and `sessions.start_time > now()`.
  - **Next Session**: The single booking with the earliest future `start_time` that is `confirmed` or `pending`.
  - **Completed (Total Workouts)**: Count bookings where `status` is `completed` or (status is `confirmed` and `sessions.start_time < now()`).
  - **Total Payments**: Sum of session prices where `booking.payment_status = 'paid'` and booking is not cancelled.
- **Interactive Bookings List**:
  - Render a modern, glassmorphic table of bookings.
  - Hover state: `hover:bg-white/60 transition-all duration-200 cursor-pointer`.
  - Clicking a row opens a details view modal.
- **Booking Details Modal**:
  - Display Title, description, schedule date/time, duration, location, price, payment status, and booking status.
  - Allow client to cancel bookings (`status` updated to `cancelled`) if the session has not started.
- **Notification Feed Widget**:
  - Show a list of recent notifications.
  - Clicking "Mark as Read" updates `is_read = true` in `public.notifications` for that notification.
  - Display a clean badge with the count of unread notifications.

---

## Checklist & Progress

### Phase 1: Data Fetching Setup
- [ ] Implement fetching of client bookings and notifications using Supabase client in `ClientDashboard`.
- [ ] Map database records to a structured `Booking` interface including nested session fields.

### Phase 2: Live Metrics & Payments stats
- [ ] Calculate "Upcoming", "Next Session", and "Completed Workouts" counts dynamically.
- [ ] Implement the in-person payments counter by summing prices of `paid` bookings.
- [ ] Display these metrics in interactive glassmorphic cards.

### Phase 3: Bookings Feed & View/Cancel Modal
- [ ] Build the interactive bookings list/feed.
- [ ] Implement the view details modal for client bookings.
- [ ] Implement the client cancellation action inside the modal, ensuring bookings are only cancelled before start time.

### Phase 4: Notification Center Integration
- [ ] Build the notification center card with unread count badge.
- [ ] Add the mark-as-read and delete notifications handlers.

### Phase 5: Verification & Testing
- [ ] Run typescript and build check (`npm run build`).
