# CRUD Documentation

## Skills CRUD

### CREATE — Add Skill
- **Page**: `/my-skills/new`
- **Fields**: skill_name, category, skill_level, description, experience, availability, preferred_mode
- **Validation**: skill_name required, category from allowed list, skill_level from allowed values
- **RLS**: `WITH CHECK (auth.uid() = user_id)` — only authenticated user can create own skills
- **Success**: "Skill added successfully." → redirect to My Skills

### READ — View Skills
- **My Skills**: `/my-skills` — shows only the current user's skills
- **Browse Skills**: `/browse-skills` — shows all skills with search and filters
- **Skill Details**: `/skills/:id` — full details with provider info

### UPDATE — Edit Skill
- **Page**: `/my-skills/:id/edit`
- **RLS**: `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` — only owner
- **Success**: "Skill updated successfully."

### DELETE — Delete Skill
- **Trigger**: Delete button with confirmation modal
- **RLS**: `USING (auth.uid() = user_id OR is_admin())` — owner or admin
- **Success**: "Skill deleted successfully."

## Help Requests CRUD

### CREATE — Create Request
- **Page**: `/help-requests/new`
- **Fields**: title, skill_needed, category, description, priority, preferred_mode, deadline
- **Skill matching**: Shows "Students Who Can Help" based on skill name + category
- **RLS**: `WITH CHECK (auth.uid() = user_id)`
- **Success**: "Request created successfully."

### READ — View Requests
- **Help Requests**: `/help-requests` — all requests with search/filter/sort
- **My Requests**: `/my-requests` — only current user's requests with actions
- **Request Details**: `/requests/:id` — full details with status update

### UPDATE — Edit Request / Status
- **Page**: `/requests/:id/edit` and inline status update on details page
- **RLS**: `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` — only owner
- **Status flow**: Open → In Progress → Completed (or Cancelled)
- **Success**: "Status updated successfully."

### DELETE — Delete Request
- **Trigger**: Delete button with confirmation modal
- **RLS**: `USING (auth.uid() = user_id OR is_admin())` — owner or admin
- **Success**: "Request deleted successfully."

## Feedback

### CREATE — Submit Feedback
- **Trigger**: "Submit Feedback" button on completed request details page
- **Fields**: rating (1-5 stars), comment (min 10 chars)
- **RLS**: `WITH CHECK (auth.uid() = requester_id AND request status = 'Completed')`
- **Unique constraint**: (request_id, requester_id) prevents duplicates
- **Success**: "Feedback submitted successfully."

### READ — View Feedback
- Displayed on request details page after submission
- Admin can view all feedback on Manage Feedback page

### DELETE — Delete Feedback
- **RLS**: `USING (is_admin())` — admin only
- **Success**: "Feedback deleted successfully."

## Profile

### READ — View Profile
- **Page**: `/profile`
- Shows: name, email, department, year, college, bio, skills count, completed help count, average rating

### UPDATE — Edit Profile
- **Inline edit** on profile page
- **Fields**: full_name, department, year, college, bio (role is not editable)
- **RLS**: `USING (auth.uid() = id) WITH CHECK (auth.uid() = id)`
- **Success**: "Profile updated successfully."
