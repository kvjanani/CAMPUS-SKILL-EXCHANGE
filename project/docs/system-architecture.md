# System Architecture

## Overview

SkillBridge uses a client-server architecture with Supabase as the backend:

```
┌──────────────────────────────────────────────────┐
│                   Frontend (React)                │
│                                                   │
│  Public Pages    │  Student Pages  │  Admin Pages  │
│  (Landing,       │  (Dashboard,    │  (Dashboard, │
│   About, Login,  │   Skills,       │   Users,     │
│   Register)      │   Requests)     │   Skills,    │
│                  │                 │   Requests, │
│                  │                 │   Feedback)  │
│                                                   │
│              Service Layer (src/services/)        │
│              Supabase Client (singleton)          │
└──────────────────────┬───────────────────────────┘
                       │ HTTPS (Supabase JS SDK)
                       ▼
┌──────────────────────────────────────────────────┐
│                Supabase Backend                   │
│                                                   │
│  ┌──────────┐  ┌────────────┐  ┌──────────────┐  │
│  │   Auth   │  │ PostgreSQL │  │     RLS      │  │
│  │ (email/  │  │  Database  │  │  (policies)  │  │
│  │ password)│  │            │  │              │  │
│  └──────────┘  └────────────┘  └──────────────┘  │
│                                                   │
│  ┌──────────────────────────────────────────┐    │
│  │     SECURITY DEFINER Functions            │    │
│  │  • is_admin() — admin role check          │    │
│  │  • offer_help() — offer help on request   │    │
│  │  • handle_new_user() — auto profile       │    │
│  └──────────────────────────────────────────┘    │
└──────────────────────────────────────────────────┘
```

## Authentication Flow

1. User registers via `supabase.auth.signUp()` with metadata (name, department, etc.)
2. A database trigger (`handle_new_user`) auto-creates a profile row
3. User logs in via `supabase.auth.signInWithPassword()`
4. Frontend fetches the profile to determine role (student/admin)
5. Protected routes check session + profile + role
6. RLS policies enforce data access at the database level

## Data Flow

- All CRUD operations go through the Supabase JS client
- RLS policies enforce ownership checks server-side
- Admin actions use `is_admin()` SECURITY DEFINER function
- The `offer_help()` function handles the atomic transition from Open → In Progress
