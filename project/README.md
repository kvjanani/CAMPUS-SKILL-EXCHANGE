# Campus Skill Exchange & Help Management System

## 1. Project Title

**Campus Skill Exchange & Help Management System (SkillBridge)**

A peer-to-peer platform where college students can share skills and request help from other students.

## 2. Project Overview

SkillBridge is a full-stack web application designed for college students to exchange skills and request help. Students can offer skills they know (e.g., Java, Python, Design) and create help requests when they need assistance with a particular skill. The platform includes skill matching, feedback, admin moderation, and a clean dashboard for tracking activity.

## 3. Problem Statement

College students often need help with subjects or skills but don't know where to find peers who can assist. At the same time, many students have valuable skills they could teach but lack a platform to offer them. SkillBridge bridges this gap by connecting students directly within their campus community.

## 4. Objectives

- Provide a platform for students to share skills and request help
- Enable secure user registration and authentication
- Implement full CRUD for skills and help requests
- Provide search and filter functionality for skills and requests
- Implement rule-based skill matching
- Allow feedback submission after help completion
- Provide admin tools for platform moderation
- Ensure responsive, accessible, and user-friendly design

## 5. Features

- **Authentication**: Email/password registration and login with role-based access (Student/Admin)
- **Skill Management**: Add, edit, delete, and browse skills with categories, levels, availability
- **Help Requests**: Create, edit, delete, and track help requests with priority and status
- **Skill Matching**: Rule-based matching finds students with relevant skills
- **Feedback System**: Rate and review after help completion (1-5 stars)
- **Admin Dashboard**: Platform statistics, user management, content moderation
- **Search & Filter**: Full-text search and multi-field filtering on skills and requests
- **Responsive Design**: Works on desktop, tablet, and mobile

## 6. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Tailwind CSS, Vite |
| Routing | React Router DOM |
| Icons | Lucide React |
| Backend/Database | Supabase (PostgreSQL, Auth, RLS) |
| Authentication | Supabase Auth (email/password) |

## 7. System Architecture

```
┌─────────────────────────────────────────────┐
│                 Frontend (React)             │
│  ┌─────────┐ ┌──────────┐ ┌───────────────┐ │
│  │ Public  │ │ Student  │ │    Admin      │ │
│  │ Pages   │ │ Pages    │ │    Pages      │ │
│  └────┬────┘ └────┬────┘ └───────┬───────┘ │
│       └───────────┴───────────────┘         │
│                  │ Services Layer           │
│                  ▼                          │
│         ┌────────────────┐                  │
│         │  Supabase JS   │                  │
│         │    Client      │                  │
│         └───────┬────────┘                  │
└─────────────────┼───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│              Supabase Backend                │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │   Auth   │ │ Database │ │     RLS      │ │
│  │ (users)  │ │ (tables) │ │  (policies)  │ │
│  └──────────┘ └──────────┘ └──────────────┘ │
│  ┌──────────────────────────────────────┐   │
│  │     SECURITY DEFINER Functions        │   │
│  │  (is_admin, offer_help, handle_new)   │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## 8. Database Design

### Tables

**profiles** (extends auth.users)
- id (UUID, PK, FK → auth.users)
- full_name (TEXT, NOT NULL)
- email (TEXT, UNIQUE, NOT NULL)
- department (TEXT, NOT NULL)
- year (TEXT, NOT NULL)
- college (TEXT, NOT NULL)
- bio (TEXT)
- role (TEXT: 'student' | 'admin', DEFAULT 'student')
- is_active (BOOLEAN, DEFAULT true)
- created_at, updated_at (TIMESTAMPTZ)

**skills**
- id (UUID, PK)
- user_id (UUID, FK → profiles, DEFAULT auth.uid())
- skill_name (TEXT, NOT NULL)
- category (TEXT, NOT NULL)
- skill_level (TEXT: Beginner|Intermediate|Advanced)
- description, experience (TEXT)
- availability (TEXT: Weekdays|Weekends|Both)
- preferred_mode (TEXT: Online|Offline|Both)
- created_at, updated_at (TIMESTAMPTZ)

**help_requests**
- id (UUID, PK)
- user_id (UUID, FK → profiles, DEFAULT auth.uid())
- title, skill_needed, category, description (TEXT)
- priority (TEXT: Low|Medium|High)
- preferred_mode (TEXT: Online|Offline|Both)
- deadline (DATE, nullable)
- status (TEXT: Open|In Progress|Completed|Cancelled)
- provider_id (UUID, FK → profiles, nullable)
- created_at, updated_at (TIMESTAMPTZ)

**feedback**
- id (UUID, PK)
- request_id (UUID, FK → help_requests)
- provider_id (UUID, FK → profiles)
- requester_id (UUID, FK → profiles, DEFAULT auth.uid())
- rating (INT, 1-5)
- comment (TEXT, min 10 chars)
- created_at (TIMESTAMPTZ)
- UNIQUE (request_id, requester_id)

### Relationships
- profiles 1:N skills (CASCADE on delete)
- profiles 1:N help_requests (CASCADE on delete)
- help_requests 1:1 feedback (CASCADE on delete)
- profiles 1:N feedback (as provider and requester)

### Security
- Row Level Security enabled on all tables
- Owner-scoped CRUD policies
- Admin override via `is_admin()` SECURITY DEFINER function
- `offer_help()` SECURITY DEFINER function for the offer-help flow
- Auto profile creation trigger on signup

## 9. Project Structure

```
project-root/
├── src/
│   ├── components/        # Reusable UI components
│   ├── context/           # Auth & Toast contexts
│   ├── pages/
│   │   ├── public/        # Landing, About, Login, Register
│   │   ├── student/       # Dashboard, Skills, Requests, Profile
│   │   └── admin/         # Admin dashboard & management pages
│   ├── services/          # Supabase API service layer
│   ├── types/             # TypeScript types & constants
│   ├── utils/             # Formatting & constants
│   ├── App.tsx            # Routes
│   └── main.tsx           # Entry point
├── supabase/
│   └── migrations/        # Database schema migration
├── docs/                  # Documentation
├── .env.example           # Environment variable template
└── README.md
```

## 10. API Documentation

The frontend communicates with Supabase via the `@supabase/supabase-js` client. All data operations go through the service layer in `src/services/`.

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `auth.signUp()` | Register new user |
| POST | `auth.signInWithPassword()` | Login |
| POST | `auth.signOut()` | Logout |

### Skills
| Method | Table | Description |
|--------|-------|-------------|
| SELECT | `skills` | List all skills (with filters) |
| INSERT | `skills` | Create skill (owner only) |
| SELECT | `skills` | Get skill by ID |
| UPDATE | `skills` | Update skill (owner only) |
| DELETE | `skills` | Delete skill (owner or admin) |

### Help Requests
| Method | Table | Description |
|--------|-------|-------------|
| SELECT | `help_requests` | List all requests (with filters) |
| INSERT | `help_requests` | Create request (owner only) |
| SELECT | `help_requests` | Get request by ID |
| UPDATE | `help_requests` | Update request (owner only) |
| DELETE | `help_requests` | Delete request (owner or admin) |
| RPC | `offer_help()` | Offer help on open request |

### Feedback
| Method | Table | Description |
|--------|-------|-------------|
| SELECT | `feedback` | List feedback |
| INSERT | `feedback` | Submit feedback (completed requests only) |
| DELETE | `feedback` | Delete feedback (admin only) |

### Admin
| Method | Table | Description |
|--------|-------|-------------|
| SELECT | `profiles` | List all users (admin only) |
| UPDATE | `profiles` | Toggle user active status (admin) |
| SELECT | `skills` | List all skills (admin) |
| DELETE | `skills` | Delete any skill (admin) |
| SELECT | `help_requests` | List all requests (admin) |
| DELETE | `help_requests` | Delete any request (admin) |
| SELECT | `feedback` | List all feedback (admin) |
| DELETE | `feedback` | Delete any feedback (admin) |

## 11. Installation Steps

```bash
# Clone the repository
git clone <repository-url>
cd campus-skill-exchange

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run the development server
npm run dev
```

## 12. Environment Variables

See `.env.example` for all required variables:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 13. Database Setup

The database schema is managed via Supabase migrations. The migration file is located at:
```
supabase/migrations/20260915061141_create_skill_exchange_schema.sql
```

This migration creates all tables, indexes, triggers, RLS policies, and helper functions.

## 14. Backend Execution

The backend is Supabase (managed PostgreSQL + Auth). No local backend server is needed — the Supabase client connects directly from the frontend using environment variables.

## 15. Frontend Execution

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type check
npm run typecheck
```

## 16. Postman Testing

See `docs/postman-collection.json` for a Postman-compatible collection with sample request/response structures for all endpoints.

## 17. Screenshots

> Add screenshots of the following pages:
> - Landing page
> - Registration page
> - Student dashboard
> - Browse skills
> - Help request details
> - Admin dashboard

## 18. Testing Details

See `docs/testing.md` for the complete testing document covering registration, login, skills CRUD, requests CRUD, feedback, and admin access tests.

## 19. Challenges and Solutions

- **Auth state timing**: Used a redirect route to wait for profile data before navigating to the correct dashboard
- **RLS policy complexity**: Used SECURITY DEFINER functions (`is_admin()`, `offer_help()`) to handle cross-table authorization
- **Skill matching**: Implemented client-side rule-based matching that ranks exact skill name matches before category matches
- **Feedback uniqueness**: Enforced via database UNIQUE constraint on (request_id, requester_id)

## 20. Future Enhancements

- AI-based skill matching
- Real-time chat between students
- Email notifications
- Push notifications
- Skill verification by faculty
- Calendar scheduling for help sessions
- Gamification and badges
- College-specific communities
- Multilingual support
- Mobile application (React Native)

## 21. GitHub Setup Instructions

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Campus Skill Exchange & Help Management System"

# Add remote
git remote add origin https://github.com/yourusername/campus-skill-exchange.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Ensure `.env` is in `.gitignore` and never committed.
