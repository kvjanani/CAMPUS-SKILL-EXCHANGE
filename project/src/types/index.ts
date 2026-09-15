export type UserRole = 'student' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  department: string;
  year: string;
  college: string;
  bio: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type Availability = 'Weekdays' | 'Weekends' | 'Both';
export type PreferredMode = 'Online' | 'Offline' | 'Both';

export interface Skill {
  id: string;
  user_id: string;
  skill_name: string;
  category: string;
  skill_level: SkillLevel;
  description: string;
  experience: string;
  availability: Availability;
  preferred_mode: PreferredMode;
  created_at: string;
  updated_at: string;
}

export interface SkillWithProfile extends Skill {
  profiles: Pick<Profile, 'id' | 'full_name' | 'department' | 'year' | 'bio' | 'email'>;
}

export type Priority = 'Low' | 'Medium' | 'High';
export type RequestStatus = 'Open' | 'In Progress' | 'Completed' | 'Cancelled';

export interface HelpRequest {
  id: string;
  user_id: string;
  title: string;
  skill_needed: string;
  category: string;
  description: string;
  priority: Priority;
  preferred_mode: PreferredMode;
  deadline: string | null;
  status: RequestStatus;
  provider_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface HelpRequestWithProfile extends HelpRequest {
  profiles: Pick<Profile, 'id' | 'full_name' | 'department' | 'year'>;
  provider?: Pick<Profile, 'id' | 'full_name'> | null;
}

export interface Feedback {
  id: string;
  request_id: string;
  provider_id: string;
  requester_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface FeedbackWithProfiles extends Feedback {
  profiles: Pick<Profile, 'id' | 'full_name' | 'department'>;
  help_requests: Pick<HelpRequest, 'id' | 'title' | 'skill_needed'>;
}

export const CATEGORIES = [
  'Programming',
  'Web Development',
  'Database',
  'Design',
  'Communication',
  'Video Editing',
  'Photography',
  'Presentation',
  'Languages',
  'Academic',
  'Other',
] as const;

export const SKILL_LEVELS: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
export const AVAILABILITY_OPTIONS: Availability[] = ['Weekdays', 'Weekends', 'Both'];
export const MODE_OPTIONS: PreferredMode[] = ['Online', 'Offline', 'Both'];
export const PRIORITY_OPTIONS: Priority[] = ['Low', 'Medium', 'High'];
export const STATUS_OPTIONS: RequestStatus[] = ['Open', 'In Progress', 'Completed', 'Cancelled'];
export const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
