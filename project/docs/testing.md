# Testing Documentation

## Registration Tests

| Test Case | Expected Result | Actual Result |
|-----------|----------------|---------------|
| Valid registration with all fields | Account created, redirect to login | ✅ Pass |
| Empty required fields | "Please enter your full name." etc. | ✅ Pass |
| Invalid email format | "Please enter a valid email address." | ✅ Pass |
| Duplicate email | "Email is already registered." | ✅ Pass |
| Password < 6 chars | "Password must be at least 6 characters long." | ✅ Pass |
| Password mismatch | "Passwords do not match." | ✅ Pass |

## Login Tests

| Test Case | Expected Result | Actual Result |
|-----------|----------------|---------------|
| Correct credentials | Login success, redirect to dashboard | ✅ Pass |
| Wrong password | "Invalid email or password." | ✅ Pass |
| Unknown email | "Invalid email or password." | ✅ Pass |
| Empty fields | "Please fill in all required fields." | ✅ Pass |

## Skills CRUD Tests

| Test Case | Expected Result | Actual Result |
|-----------|----------------|---------------|
| Create valid skill | "Skill added successfully." | ✅ Pass |
| Create with empty skill name | "Please enter a skill name." | ✅ Pass |
| Read skills (My Skills) | Shows only user's skills | ✅ Pass |
| Read skills (Browse) | Shows all skills with filters | ✅ Pass |
| Update own skill | "Skill updated successfully." | ✅ Pass |
| Delete own skill | Confirmation modal → "Skill deleted successfully." | ✅ Pass |
| Unauthorized update (different user) | RLS blocks, error shown | ✅ Pass |
| Unauthorized delete (different user) | RLS blocks, error shown | ✅ Pass |

## Help Requests CRUD Tests

| Test Case | Expected Result | Actual Result |
|-----------|----------------|---------------|
| Create request | "Request created successfully." | ✅ Pass |
| Read requests (all) | Shows all with search/filter | ✅ Pass |
| Read my requests | Shows only user's requests | ✅ Pass |
| Update request status | "Status updated successfully." | ✅ Pass |
| Edit request | "Request updated successfully." | ✅ Pass |
| Delete request | Confirmation → "Request deleted successfully." | ✅ Pass |
| Invalid request ID | "Request not found." | ✅ Pass |
| Unauthorized access | RLS blocks the operation | ✅ Pass |
| Offer help on open request | "Help offered successfully." | ✅ Pass |
| Offer help on own request | "You cannot offer help on your own request." | ✅ Pass |

## Feedback Tests

| Test Case | Expected Result | Actual Result |
|-----------|----------------|---------------|
| Valid feedback (completed request) | "Feedback submitted successfully." | ✅ Pass |
| Invalid rating (outside 1-5) | Database CHECK constraint blocks | ✅ Pass |
| Duplicate feedback | UNIQUE constraint blocks | ✅ Pass |
| Feedback before completion | RLS blocks (status != Completed) | ✅ Pass |
| Comment < 10 chars | "Comment must be at least 10 characters." | ✅ Pass |

## Admin Tests

| Test Case | Expected Result | Actual Result |
|-----------|----------------|---------------|
| Admin accesses admin dashboard | Shows admin dashboard with stats | ✅ Pass |
| Student attempts admin access | Redirect to /unauthorized | ✅ Pass |
| Admin views all users | Shows all users in table | ✅ Pass |
| Admin deactivates user | "User deactivated successfully." | ✅ Pass |
| Admin deletes skill | "Skill deleted successfully." | ✅ Pass |
| Admin deletes request | "Request deleted successfully." | ✅ Pass |
| Admin deletes feedback | "Feedback deleted successfully." | ✅ Pass |

## Search & Filter Tests

| Test Case | Expected Result | Actual Result |
|-----------|----------------|---------------|
| Search skills by name | Filters to matching skills | ✅ Pass |
| Filter skills by category | Shows only selected category | ✅ Pass |
| Filter skills by level | Shows only selected level | ✅ Pass |
| Search requests by title | Filters to matching requests | ✅ Pass |
| Filter requests by status | Shows only selected status | ✅ Pass |
| Sort requests by priority | High → Medium → Low order | ✅ Pass |
| Clear filters | Shows all results | ✅ Pass |

## Skill Matching Tests

| Test Case | Expected Result | Actual Result |
|-----------|----------------|---------------|
| Request "Java" matches skill "Java" | Exact match shown first | ✅ Pass |
| Request "Java" matches "Programming" category | Category match shown after exact | ✅ Pass |
| No matching skills | No matching section shown | ✅ Pass |
