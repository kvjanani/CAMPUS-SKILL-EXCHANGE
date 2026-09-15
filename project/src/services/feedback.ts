import { supabase } from './supabaseClient';
import type { Feedback, FeedbackWithProfiles } from '@/types';

export interface FeedbackInput {
  request_id: string;
  provider_id: string;
  rating: number;
  comment: string;
}

export async function createFeedback(input: FeedbackInput) {
  const { data, error } = await supabase
    .from('feedback')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Feedback;
}

export async function getAllFeedback() {
  const { data, error } = await supabase
    .from('feedback')
    .select('*, profiles!feedback_requester_id_fkey(id, full_name, department), help_requests(id, title, skill_needed)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as FeedbackWithProfiles[];
}

export async function getFeedbackForProvider(providerId: string) {
  const { data, error } = await supabase
    .from('feedback')
    .select('*, profiles!feedback_requester_id_fkey(id, full_name, department), help_requests(id, title, skill_needed)')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as FeedbackWithProfiles[];
}

export async function getFeedbackForRequest(requestId: string) {
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('request_id', requestId)
    .maybeSingle();
  if (error) throw error;
  return data as Feedback | null;
}

export async function deleteFeedback(id: string) {
  const { error } = await supabase.from('feedback').delete().eq('id', id);
  if (error) throw error;
}

export async function getAverageRatingForProvider(providerId: string): Promise<number> {
  const { data, error } = await supabase
    .from('feedback')
    .select('rating')
    .eq('provider_id', providerId);
  if (error) throw error;
  if (!data || data.length === 0) return 0;
  const sum = data.reduce((acc, f) => acc + f.rating, 0);
  return sum / data.length;
}
