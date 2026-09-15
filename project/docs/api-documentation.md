# API Documentation

All data operations use the Supabase JS client (`@supabase/supabase-js`). The service layer in `src/services/` wraps these calls.

## Authentication

### Register
```typescript
supabase.auth.signUp({
  email: "user@example.com",
  password: "password123",
  options: { data: { full_name, department, year, college, bio } }
})
```
**Response**: `{ user, session }` or error

### Login
```typescript
supabase.auth.signInWithPassword({ email, password })
```
**Response**: `{ user, session }` or error

### Logout
```typescript
supabase.auth.signOut()
```

## Skills

### List Skills (with filters)
```typescript
supabase.from('skills')
  .select('*, profiles!skills_user_id_fkey(id, full_name, department, year, bio, email)')
  .ilike('skill_name', `%${search}%`)
  .eq('category', category)
  .eq('skill_level', level)
  .order('created_at', { ascending: false })
```

### Create Skill
```typescript
supabase.from('skills').insert({
  skill_name, category, skill_level, description, experience, availability, preferred_mode
}).select().single()
```

### Get Skill by ID
```typescript
supabase.from('skills').select('*, profiles!skills_user_id_fkey(...)').eq('id', id).maybeSingle()
```

### Update Skill
```typescript
supabase.from('skills').update({ ...fields }).eq('id', id).select().single()
```

### Delete Skill
```typescript
supabase.from('skills').delete().eq('id', id)
```

## Help Requests

### List Requests (with filters)
```typescript
supabase.from('help_requests')
  .select('*, profiles!help_requests_user_id_fkey(...), provider:profiles!help_requests_provider_id_fkey(...)')
  .order('created_at', { ascending: false })
```

### Create Request
```typescript
supabase.from('help_requests').insert({
  title, skill_needed, category, description, priority, preferred_mode, deadline
}).select().single()
```

### Update Request / Status
```typescript
supabase.from('help_requests').update({ status: 'Completed' }).eq('id', id)
```

### Delete Request
```typescript
supabase.from('help_requests').delete().eq('id', id)
```

### Offer Help (RPC)
```typescript
supabase.rpc('offer_help', { request_id: id })
```
**Response**: `{ success: boolean, error?: string, message?: string }`

## Feedback

### Submit Feedback
```typescript
supabase.from('feedback').insert({
  request_id, provider_id, rating, comment
}).select().single()
```

### Check Existing Feedback
```typescript
supabase.from('feedback').select('*').eq('request_id', id).maybeSingle()
```

### Delete Feedback (admin only)
```typescript
supabase.from('feedback').delete().eq('id', id)
```

## Admin

### Get Stats
Parallel queries to count users, skills, requests, and feedback.

### Manage Users
```typescript
// Toggle active
supabase.from('profiles').update({ is_active: !isActive }).eq('id', userId)
// Delete user
supabase.auth.admin.deleteUser(userId)
```

### Manage Skills/Requests/Feedback
Admin can delete any record via the same delete operations (RLS allows admin via `is_admin()`).

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Successful GET/PUT |
| 201 | Successful creation |
| 400 | Validation error |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (not owner/admin) |
| 404 | Not found |
| 500 | Server error |
