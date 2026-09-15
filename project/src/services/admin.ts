import { supabase } from './supabaseClient';
import type { Profile, SkillWithProfile, HelpRequestWithProfile, FeedbackWithProfiles } from '@/types';

export async function getAdminStats() {
  const [usersRes, skillsRes, requestsRes, feedbackRes] = await Promise.all([
    supabase.from('profiles').select('id, role, is_active'),
    supabase.from('skills').select('id'),
    supabase.from('help_requests').select('id, status'),
    supabase.from('feedback').select('id'),
  ]);

  if (usersRes.error) throw usersRes.error;
  if (skillsRes.error) throw skillsRes.error;
  if (requestsRes.error) throw requestsRes.error;
  if (feedbackRes.error) throw feedbackRes.error;

  const totalUsers = usersRes.data.length;
  const totalSkills = skillsRes.data.length;
  const totalRequests = requestsRes.data.length;
  const openRequests = requestsRes.data.filter((r) => r.status === 'Open').length;
  const inProgressRequests = requestsRes.data.filter((r) => r.status === 'In Progress').length;
  const completedRequests = requestsRes.data.filter((r) => r.status === 'Completed').length;
  const totalFeedback = feedbackRes.data.length;

  return {
    totalUsers,
    totalSkills,
    totalRequests,
    openRequests,
    inProgressRequests,
    completedRequests,
    totalFeedback,
  };
}

export async function getAdminProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Profile[];
}

export async function getAdminSkills() {
  const { data, error } = await supabase
    .from('skills')
    .select('*, profiles!skills_user_id_fkey(id, full_name, department, year, email)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as SkillWithProfile[];
}

export async function getAdminRequests() {
  const { data, error } = await supabase
    .from('help_requests')
    .select('*, profiles!help_requests_user_id_fkey(id, full_name, department, year), provider:profiles!help_requests_provider_id_fkey(id, full_name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as HelpRequestWithProfile[];
}

export async function getAdminFeedback() {
  const { data, error } = await supabase
    .from('feedback')
    .select('*, profiles!feedback_requester_id_fkey(id, full_name, department), help_requests(id, title, skill_needed)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as FeedbackWithProfiles[];
}
