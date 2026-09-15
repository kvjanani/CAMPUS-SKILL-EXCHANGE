# Database / ER Diagram Description

## Tables

### profiles
Extends `auth.users` with student-specific fields. One row per registered user.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, FK → auth.users |
| full_name | TEXT | NOT NULL |
| email | TEXT | UNIQUE, NOT NULL |
| department | TEXT | NOT NULL |
| year | TEXT | NOT NULL |
| college | TEXT | NOT NULL |
| bio | TEXT | |
| role | TEXT | CHECK (student\|admin), DEFAULT 'student' |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

### skills
Skills offered by students. Each skill belongs to one user.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → profiles, DEFAULT auth.uid() |
| skill_name | TEXT | NOT NULL |
| category | TEXT | NOT NULL |
| skill_level | TEXT | CHECK (Beginner\|Intermediate\|Advanced) |
| description | TEXT | |
| experience | TEXT | |
| availability | TEXT | CHECK (Weekdays\|Weekends\|Both) |
| preferred_mode | TEXT | CHECK (Online\|Offline\|Both) |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

### help_requests
Requests for help created by students.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → profiles, DEFAULT auth.uid() |
| title | TEXT | NOT NULL |
| skill_needed | TEXT | NOT NULL |
| category | TEXT | NOT NULL |
| description | TEXT | |
| priority | TEXT | CHECK (Low\|Medium\|High) |
| preferred_mode | TEXT | CHECK (Online\|Offline\|Both) |
| deadline | DATE | nullable |
| status | TEXT | CHECK (Open\|In Progress\|Completed\|Cancelled) |
| provider_id | UUID | FK → profiles, nullable |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

### feedback
Feedback submitted after a help request is completed.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| request_id | UUID | FK → help_requests |
| provider_id | UUID | FK → profiles |
| requester_id | UUID | FK → profiles, DEFAULT auth.uid() |
| rating | INT | CHECK (1-5) |
| comment | TEXT | CHECK (length >= 10) |
| created_at | TIMESTAMPTZ | DEFAULT now() |

**UNIQUE**: (request_id, requester_id) — prevents duplicate feedback

## Relationships

```
auth.users 1──1 profiles
profiles   1──N skills
profiles   1──N help_requests (as requester)
profiles   1──N help_requests (as provider, nullable)
help_requests 1──1 feedback
profiles   1──N feedback (as provider)
profiles   1──N feedback (as requester)
```

## Indexes

- idx_skills_user_id, idx_skills_category, idx_skills_skill_name
- idx_help_requests_user_id, idx_help_requests_category, idx_help_requests_status
- idx_feedback_request_id, idx_feedback_provider_id
