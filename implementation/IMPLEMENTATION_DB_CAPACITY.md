# Implementation Plan - Default Capacity & Custom Descriptions (IMPLEMENTATION_DB_CAPACITY.md)

This plan tracks the database and frontend modifications required to add a default `capacity` column to the `session_types` templates and a custom `description` column to the `sessions` instances.

---

## Objective
Enable templates to define a default capacity value, which automatically pre-fills during session scheduling. Also, add the ability for scheduled sessions to have their own custom description field, surfacing both fields clearly on the admin dashboard tables and modals.

---

## Checklist & Progress

### Phase 1: Database Schema
- [x] Create a Supabase migration file `20260618000000_add_capacity_and_description.sql`
- [x] Run migration to add `capacity` (integer) to `public.session_types`
- [x] Run migration to add `description` (text) to `public.sessions`

### Phase 2: Session Types Tab Updates (Templates)
- [x] Update the `SessionType` TypeScript type to include `capacity: number | null`
- [x] Add a capacity number input field to the create/edit template modal (default empty)
- [x] Show the default capacity value in its own column on the templates table
- [x] Position the description in its own column in the table (removing it from below the title)
- [x] Display default capacity inside the View Details modal for templates

### Phase 3: Scheduled Sessions Tab Updates (Schedule)
- [x] Update `Session` TypeScript type to include `description: string | null`
- [x] Autofill: Load the selected template's capacity default into the Capacity field on selection
- [x] Add capacity and description inputs to the scheduled session modal
- [x] Add a new Description column in the active sessions schedule table
- [x] Render custom description in the scheduled session view details modal
- [x] Implement the Edit Session functionality to allow modifications to description and capacity

### Phase 4: Verification & Build Check
- [x] Run production build check (`npm run build`) to ensure type safety and build validity
- [x] Close GitHub Issue #5

---

## Detailed Component Specifications

### 1. Database Schema
```sql
ALTER TABLE public.session_types ADD COLUMN capacity INTEGER DEFAULT NULL;
ALTER TABLE public.sessions ADD COLUMN description TEXT DEFAULT NULL;
```

### 2. Frontend Modals & Forms

#### [TypesTab.tsx](file:///Users/ryan/Diesel%20Fitness%20Demo/src/components/admin/sessions/TypesTab.tsx)
- Grid layout updated from `md:grid-cols-4` to `md:grid-cols-5` to accommodate `Default Capacity`.
- Table columns modified:
  1. `Title & Image`
  2. `Description`
  3. `Category`
  4. `Details`
  5. `Default Capacity`
  6. `Price`
  7. `Actions`

#### [ScheduleTab.tsx](file:///Users/ryan/Diesel%20Fitness%20Demo/src/components/admin/sessions/ScheduleTab.tsx)
- Custom listener `handleSessionNameChange` checks templates list and assigns `max_slots` from the matching template's capacity default.
- Modal supports `editingSession` state and updates inputs dynamically.
