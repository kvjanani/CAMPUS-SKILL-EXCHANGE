/*
# Create Campus Skill Exchange Schema

## Overview
Creates the complete database schema for the Campus Skill Exchange & Help Management System.
This includes profiles (extending auth.users), skills, help_requests, and feedback tables
with full Row Level Security policies, triggers for automatic profile creation and timestamp updates,
and helper functions for admin checks and the "offer help" flow.

## Tables

### 1. profiles
Extends auth.users with student-specific fields.
- id (uuid, PK, references auth.users)
- full_name (text, not null)
- email (text, unique, not null)
- department (text, not null)
- year (text, not null)
- college (text, not null)
- bio (text, nullable)
- role (text, default 'student')
- is_active (boolean, default true)
- created_at, updated_at (timestamptz)

### 2. skills
Skills that students offer to share.
- id, user_id, skill_name, category, skill_level, description, experience, availability, preferred_mode, created_at, updated_at

### 3. help_requests
Requests for help with a particular skill.
- id, user_id, title, skill_needed, category, description, priority, preferred_mode, deadline, status, provider_id, created_at, updated_at

### 4. feedback
Feedback submitted after a help request is completed.
- id, request_id, provider_id, requester_id, rating (1-5), comment, created_at
- Unique constraint on (request_id, requester_id) prevents duplicate feedback

## Security
- RLS enabled on all tables
- profiles: users read/update own; admins read/update/delete all
- skills: all authenticated can read; owner can create/update/delete; admin can delete any
- help_requests: all authenticated can read; owner can create/update/delete; admin can delete any
- feedback: all authenticated can read; requester can insert for completed own requests; admin can delete any
- SECURITY DEFINER function offer_help() allows any user to offer help on an open request
- SECURITY DEFINER function is_admin() checks admin role for RLS policies

## Triggers
- on_auth_user_created: auto-creates a profile when a user signs up
- update_updated_at: auto-updates updated_at on profiles, skills, help_requests
*/

-- ============================================
-- TABLES (created first so functions can reference them)
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  department text NOT NULL DEFAULT 'Not Specified',
  year text NOT NULL DEFAULT '1st Year',
  college text NOT NULL DEFAULT 'Not Specified',
  bio text DEFAULT '',
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  category text NOT NULL,
  skill_level text NOT NULL CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced')),
  description text DEFAULT '',
  experience text DEFAULT '',
  availability text NOT NULL DEFAULT 'Both' CHECK (availability IN ('Weekdays', 'Weekends', 'Both')),
  preferred_mode text NOT NULL DEFAULT 'Both' CHECK (preferred_mode IN ('Online', 'Offline', 'Both')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.help_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  skill_needed text NOT NULL,
  category text NOT NULL,
  description text DEFAULT '',
  priority text NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  preferred_mode text NOT NULL DEFAULT 'Both' CHECK (preferred_mode IN ('Online', 'Offline', 'Both')),
  deadline date,
  status text NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Completed', 'Cancelled')),
  provider_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.help_requests(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL CHECK (length(comment) >= 10),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (request_id, requester_id)
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON public.skills(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_skill_name ON public.skills(skill_name);
CREATE INDEX IF NOT EXISTS idx_help_requests_user_id ON public.help_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_help_requests_category ON public.help_requests(category);
CREATE INDEX IF NOT EXISTS idx_help_requests_status ON public.help_requests(status);
CREATE INDEX IF NOT EXISTS idx_feedback_request_id ON public.feedback(request_id);
CREATE INDEX IF NOT EXISTS idx_feedback_provider_id ON public.feedback(provider_id);

-- ============================================
-- HELPER FUNCTIONS (after tables exist)
-- ============================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, department, year, college, bio, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'department', 'Not Specified'),
    COALESCE(NEW.raw_user_meta_data->>'year', '1st Year'),
    COALESCE(NEW.raw_user_meta_data->>'college', 'Not Specified'),
    COALESCE(NEW.raw_user_meta_data->>'bio', ''),
    'student'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.offer_help(request_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  req_user_id uuid;
  req_status text;
BEGIN
  SELECT user_id, status INTO req_user_id, req_status
  FROM public.help_requests
  WHERE id = request_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Request not found');
  END IF;

  IF req_user_id = auth.uid() THEN
    RETURN json_build_object('success', false, 'error', 'You cannot offer help on your own request');
  END IF;

  IF req_status != 'Open' THEN
    RETURN json_build_object('success', false, 'error', 'This request is no longer open');
  END IF;

  UPDATE public.help_requests
  SET provider_id = auth.uid(), status = 'In Progress', updated_at = now()
  WHERE id = request_id AND status = 'Open';

  RETURN json_build_object('success', true, 'message', 'Help offered successfully');
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trigger_skills_updated_at ON public.skills;
CREATE TRIGGER trigger_skills_updated_at
  BEFORE UPDATE ON public.skills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trigger_help_requests_updated_at ON public.help_requests;
CREATE TRIGGER trigger_help_requests_updated_at
  BEFORE UPDATE ON public.help_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- RLS POLICIES — profiles
-- ============================================
DROP POLICY IF EXISTS "select_own_or_admin_profiles" ON public.profiles;
CREATE POLICY "select_own_or_admin_profiles" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "update_own_or_admin_profiles" ON public.profiles;
CREATE POLICY "update_own_or_admin_profiles" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "delete_admin_profiles" ON public.profiles;
CREATE POLICY "delete_admin_profiles" ON public.profiles FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================
-- RLS POLICIES — skills
-- ============================================
DROP POLICY IF EXISTS "select_all_skills" ON public.skills;
CREATE POLICY "select_all_skills" ON public.skills FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_skills" ON public.skills;
CREATE POLICY "insert_own_skills" ON public.skills FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_skills" ON public.skills;
CREATE POLICY "update_own_skills" ON public.skills FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_or_admin_skills" ON public.skills;
CREATE POLICY "delete_own_or_admin_skills" ON public.skills FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());

-- ============================================
-- RLS POLICIES — help_requests
-- ============================================
DROP POLICY IF EXISTS "select_all_help_requests" ON public.help_requests;
CREATE POLICY "select_all_help_requests" ON public.help_requests FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_help_requests" ON public.help_requests;
CREATE POLICY "insert_own_help_requests" ON public.help_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_help_requests" ON public.help_requests;
CREATE POLICY "update_own_help_requests" ON public.help_requests FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_or_admin_help_requests" ON public.help_requests;
CREATE POLICY "delete_own_or_admin_help_requests" ON public.help_requests FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());

-- ============================================
-- RLS POLICIES — feedback
-- ============================================
DROP POLICY IF EXISTS "select_all_feedback" ON public.feedback;
CREATE POLICY "select_all_feedback" ON public.feedback FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_feedback" ON public.feedback;
CREATE POLICY "insert_own_feedback" ON public.feedback FOR INSERT
  TO authenticated WITH CHECK (
  auth.uid() = requester_id
  AND EXISTS (
    SELECT 1 FROM public.help_requests hr
    WHERE hr.id = feedback.request_id
    AND hr.status = 'Completed'
  )
);

DROP POLICY IF EXISTS "delete_admin_feedback" ON public.feedback;
CREATE POLICY "delete_admin_feedback" ON public.feedback FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================
-- GRANTS
-- ============================================
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.offer_help(uuid) TO authenticated;
