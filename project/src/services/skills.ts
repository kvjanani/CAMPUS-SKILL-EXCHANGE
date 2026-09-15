import { supabase } from './supabaseClient';
import type { Skill, SkillWithProfile, SkillLevel, Availability, PreferredMode } from '@/types';

export interface SkillInput {
  skill_name: string;
  category: string;
  skill_level: SkillLevel;
  description: string;
  experience: string;
  availability: Availability;
  preferred_mode: PreferredMode;
}

export async function createSkill(input: SkillInput) {
  const { data, error } = await supabase
    .from('skills')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Skill;
}

export async function getMySkills() {
  const { data, error } = await supabase
    .from('skills')
    .select('*, profiles!skills_user_id_fkey(id, full_name, department, year, bio, email)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as SkillWithProfile[];
}

export async function getSkillById(id: string) {
  const { data, error } = await supabase
    .from('skills')
    .select('*, profiles!skills_user_id_fkey(id, full_name, department, year, bio, email)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as SkillWithProfile | null;
}

export async function updateSkill(id: string, input: Partial<SkillInput>) {
  const { data, error } = await supabase
    .from('skills')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Skill;
}

export async function deleteSkill(id: string) {
  const { error } = await supabase.from('skills').delete().eq('id', id);
  if (error) throw error;
}

export async function getAllSkills() {
  const { data, error } = await supabase
    .from('skills')
    .select('*, profiles!skills_user_id_fkey(id, full_name, department, year, bio, email)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as SkillWithProfile[];
}

export async function getSkillsByUser(userId: string) {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Skill[];
}
