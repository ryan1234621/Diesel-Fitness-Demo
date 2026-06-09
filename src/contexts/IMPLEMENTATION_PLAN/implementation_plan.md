# Implementation Plan - Next.js & Tailwind Pivot

This document outlines the approach for transitioning the Diesel Fitness application to **Next.js (App Router)** and **Tailwind CSS**, adopting the new Soft Beige and Black branding, and structuring the dashboards.

---

## Goal Description

We will replace the existing Vite React scaffolding with a fresh Next.js (App Router) application. We will use Tailwind CSS for all styling, implement the user-requested color palette, and recreate the routing structure using Next.js file-system routing.

## User Review Required

> [!WARNING]  
> **Codebase Teardown**: Executing this plan will require deleting the current Vite-based `src/` folder, `index.html`, and `package.json` to allow `create-next-app` to scaffold cleanly in the root directory. 

> [!IMPORTANT]  
> **Supabase Next.js Strategy**: We will use `@supabase/supabase-js` for standard client-side data fetching to start, replicating the previous functionality. If server-side rendering (SSR) of user sessions is strictly required later, we can introduce `@supabase/ssr`.

## Open Questions

> [!NOTE]  
> Please let me know if you agree with the teardown approach so we can proceed with the Next.js installation.

## Proposed Changes

### 1. Cleanup Old Framework
#### [DELETE] Old Vite Files
Remove Vite-specific files to prepare for Next.js initialization:
- `package.json`, `package-lock.json`
- `vite.config.ts`
- `tsconfig.json`, `tsconfig.node.json`, `tsconfig.app.json`
- `index.html`
- `src/` directory (entirely)

### 2. Next.js Initialization
#### [NEW] Next.js Scaffold
Initialize the project using `npx create-next-app@latest`:
- App Router: Yes
- TypeScript: Yes
- Tailwind CSS: Yes
- `src/` directory: Yes
- Import alias: `@/*`

### 3. Styling & Branding Setup
#### [MODIFY] `tailwind.config.ts`
Inject the custom branding colors:
- **Primary Background**: The Soft Beige (`#F4F3EF`)
- **Primary Text**: The "Black" (`#111111` or `#0F172A`)
- **Secondary Text**: The Muted Gray (`#555555` or `#64748B`)
- Add accent colors for primary buttons (e.g., solid black or dark slate).

#### [MODIFY] `src/app/globals.css`
Establish baseline styles, remove default Next.js dark mode invert rules, and configure the body background to `#F4F3EF`.

### 4. Application Routing (App Router)
Rebuild the routing structure using Next.js conventions:

#### [NEW] Public Routes
- `src/app/page.tsx`: Landing page
- `src/app/login/page.tsx`: Login view
- `src/app/signup/page.tsx`: Registration view
- `src/app/banned/page.tsx`: Banned user notice

#### [NEW] Shared & Protected Layouts
- `src/app/layout.tsx`: Root layout (includes ToastProvider and AuthProvider).
- `src/app/client/layout.tsx`: Client dashboard shell/sidebar.
- `src/app/admin/layout.tsx`: Admin dashboard shell/sidebar.

#### [NEW] Client Pages
- `src/app/client/dashboard/page.tsx`
- `src/app/client/bookings/page.tsx`

#### [NEW] Admin Pages
- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/sessions/page.tsx`
- `src/app/admin/bookings/page.tsx`
- `src/app/admin/clients/page.tsx`
- `src/app/admin/reporting/page.tsx`
- `src/app/admin/settings/page.tsx`

### 5. Supabase & Contexts
#### [NEW] `src/lib/supabase.ts`
Client initializer for Supabase.

#### [NEW] `src/components/Providers.tsx`
Client components to wrap the Next.js children with Contexts (Auth and Toast).

### 6. Database Verification
- The existing `schema.sql` already implements the correct logic: clients retain their `client` role even if they cancel a booking, as the trigger only fires on `INSERT`. No changes are needed there.

## Verification Plan

### Automated Tests
- Run `npm run build` to verify Next.js compiles all pages and types cleanly.

### Manual Verification
- Start `npm run dev`.
- Verify the new Tailwind CSS color scheme (Soft Beige background, Black text) is applied across all routes.
- Test routing and client-side Supabase authentication flows in the Next.js environment.
