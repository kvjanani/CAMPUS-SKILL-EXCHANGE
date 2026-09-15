# Requirements

## Functional Requirements

- User registration with full name, email, password, department, year, college, bio
- User login/logout with email and password
- Role-based access: Student and Admin
- Student can add, edit, delete, and browse skills
- Student can create, edit, delete, and browse help requests
- Student can update request status (Open, In Progress, Completed, Cancelled)
- Student can offer help on open requests
- Student can submit feedback (1-5 stars + comment) on completed requests
- Student can view their profile and edit non-role fields
- Student can view dashboard with stats and recent activity
- Admin can view platform statistics
- Admin can manage users (activate/deactivate/delete)
- Admin can manage skills (delete inappropriate content)
- Admin can manage help requests (delete inappropriate content)
- Admin can manage feedback (delete inappropriate content)
- Search and filter on skills (name, category, level, availability, mode)
- Search and filter on requests (title, skill, category, priority, status)
- Skill matching displays students who can help based on skill name and category

## Non-Functional Requirements

- **Security**: Passwords hashed via Supabase Auth, RLS on all tables, owner-scoped policies
- **Performance**: Database indexes on frequently queried columns
- **Responsive**: Works on desktop, tablet, and mobile
- **Accessibility**: Proper labels, contrast, keyboard navigation
- **Usability**: Loading states, empty states, error states, toast notifications, delete confirmations
