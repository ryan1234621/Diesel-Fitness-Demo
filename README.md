# Diesel Fitness 🏋️‍♂️

Diesel Fitness is a premium Personal Trainer Booking and Management web application designed to provide an exclusive, high-end experience for both personal trainers (admins) and their clients.

## 🌟 Overview

The platform is split into two primary portals:
- **Admin Portal**: A comprehensive dashboard for personal trainers to manage their business, create and schedule sessions, oversee client bookings, and view high-level analytics.
- **Client Portal**: A streamlined interface for clients to manage their profiles, view upcoming training schedules, and seamlessly book new sessions.

## 🛠 Tech Stack

This project is built using modern web development standards to ensure a fast, reliable, and aesthetically pleasing experience.

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend & Auth**: [Supabase](https://supabase.com/) (PostgreSQL Database, Row Level Security, and Authentication)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Date Parsing**: [date-fns](https://date-fns.org/)

## 🎨 Design System

The application utilizes a custom, high-end "Soft Beige & Black" branding scheme to convey a premium fitness experience:
- **Primary Background**: Soft Beige (`#F4F3EF`)
- **Primary Text**: Black (`#111111`)
- **Secondary Text**: Muted Gray (`#555555`)

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js installed and access to the project's Supabase instance.

### Installation

1. Install the dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables. Create a `.env.local` or `.env` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🗄️ Database Schema

The foundational PostgreSQL schema for this application is documented in `schema.sql`. It includes tables for `profiles`, `sessions`, `session_types`, and `bookings`, alongside robust Row Level Security (RLS) policies and database triggers to auto-sync Auth users with the public profile system.
