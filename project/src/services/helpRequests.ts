import { supabase } from './supabaseClient';
import type { HelpRequest, HelpRequestWithProfile, Priority, PreferredMode, RequestStatus } from '@/types';

export interface HelpRequestInput {
  title: string;
  skill_needed: string;
  category: string;
  description: string;
  priority: Priority;
  preferred_mode: PreferredMode;
  deadline: string | null;
  status?: RequestStatus;
}

export async function createHelpRequest(input: HelpRequestInput) {
  const { data, error } = await supabase
    .from('help_requests')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as HelpRequest;
}

export async function getAllHelpRequests() {
  const { data, error } = await supabase
    .from('help_requests')
    .select('*, profiles!help_requests_user_id_fkey(id, full_name, department, year), provider:profiles!help_requests_provider_id_fkey(id, full_name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as HelpRequestWithProfile[];
}

export async function getMyHelpRequests() {
  const { data, error } = await supabase
    .from('help_requests')
    .select('*, profiles!help_requests_user_id_fkey(id, full_name, department, year), provider:profiles!help_requests_provider_id_fkey(id, full_name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as HelpRequestWithProfile[];
}

export async function getHelpRequestById(id: string) {
  const { data, error } = await supabase
    .from('help_requests')
    .select('*, profiles!help_requests_user_id_fkey(id, full_name, department, year, bio, email), provider:profiles!help_requests_provider_id_fkey(id, full_name)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as HelpRequestWithProfile | null;
}

export async function updateHelpRequest(id: string, input: Partial<HelpRequestInput>) {
  const { data, error } = await supabase
    .from('help_requests')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as HelpRequest;
}

export async function deleteHelpRequest(id: string) {
  const { error } = await supabase.from('help_requests').delete().eq('id', id);
  if (error) throw error;
}

export async function offerHelp(requestId: string) {
  const { data, error } = await supabase.rpc('offer_help', { request_id: requestId });
  if (error) throw error;
  return data as { success: boolean; error?: string; message?: string };
}

export async function updateRequestStatus(id: string, status: RequestStatus) {
  return updateHelpRequest(id, { status });
}
