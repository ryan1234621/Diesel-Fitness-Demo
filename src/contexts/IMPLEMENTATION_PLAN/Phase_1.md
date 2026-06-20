# Phase 1: Profiles and Global Navigation

## Objectives
- Create a unified profile page accessible to all user roles (Admin, Client, User).
- Implement a modern profile dropdown on the root page for authenticated users.

## Checklist
- [x] Create this `Phase_1.md` document with the checklist.
- [x] Move/Create the role-agnostic profile page at `/profile`.
- [x] Connect the profile page to Supabase to display the user's real name, email, and role.
- [x] Update the root page (`/`) to use `useAuth()` to check authentication status.
- [x] Replace the "Log In" / "Get Started" buttons with a Profile Dropdown if the user is logged in.
- [x] The dropdown should display a profile picture (or a placeholder) and contain links to "Profile" and "Log Out".
- [x] Verify that the existing "Log Out" functionality remains intact.


# Phase 1: Foundation (Database & Auth) - Implementation Plan

## 1. Supabase Integration
- [x] **Create AuthContext**: Create `AuthContext` to provide user session and profile data (including roles) across the app.

---

## 3. Authentication UI
- [x] **Signup Page**: Account creation with email/password.
- [x] **Login Page**: Authentication with email/password.
- [x] **Logout Logic**: Simple session termination.

---

## 4. Mockup Dashboards & Routing
- [x] **Role-Based Routing**: 
  - Implement `ProtectedRoute` to handle `user` vs `admin` access.
- [x] **User Dashboard (Mockup)**: 
  - Basic "Welcome" view for users/clients.
- [x] **Admin Dashboard (Mockup)**: 
  - Basic "Admin Overview" view.
- [x] **Verification**: 
  - Test signup flow -> ensure profile created with `user` role.
  - Test login -> redirect to correct mockup based on role.

---

## 5. User Profiles & Global Navigation
- [x] **Profile Page**: 
  - Create `/profile` route and page.
  - Allow users to view/edit their `first_name`.
  - Display user role and email.
- [x] **Global Header Update**: 
  - Replace "Dashboard" button with a Profile Dropdown.
  - Show "Avatar" with fallback (initials).
  - Dropdown options: **Profile**, **Dashboard**, and **Log Out**.
- [x] **Mobile Navigation**: 
  - Update mobile menu to include Profile, Dashboard, and Log Out links.

---

## Status Tracking
* **Status**: ✅ Completed
* **Assigned Issue**: #4
* **Branch**: `feat/4-auth-profiles`

---

## 6. Additional Profile & Dropdown Enhancements
**Start Datetime**: `2026-06-13T07:38:00Z`
*(Tracked per GITHUB_ISSUES_GUIDE.md)*

### Objectives
- Create the profiles for users of any role type.
- Add a profile button (with picture or placeholder) instead of a dashboard button on the root page.
- Ensure the profile button opens a dropdown menu with "Profile" and "Log Out".

### Checklist
- [x] Create the role-agnostic profile page.
- [x] Add the profile button to the root page.
- [x] Implement the dropdown menu with links to "Profile" and "Log Out".
- [x] Verify "Log Out" remains functional.