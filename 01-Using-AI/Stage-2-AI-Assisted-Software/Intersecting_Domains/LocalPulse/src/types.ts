export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type ReportStatus =
  | 'reported'
  | 'verified'
  | 'under_review'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'reopened';
export type Recurrence = 'one_time' | 'recurring' | 'continuous';
export type UserRole = 'citizen' | 'ngo' | 'government' | 'admin';

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  organization_name: string | null;
  verified: boolean;
  points: number;
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  title: string;
  category: string;
  description: string;
  severity: Severity;
  status: ReportStatus;
  recurrence: Recurrence;
  is_anonymous: boolean;
  photos: string[];
  video_url: string | null;
  country: string;
  state: string | null;
  district: string | null;
  city: string;
  village: string | null;
  postal_code: string | null;
  latitude: number;
  longitude: number;
  date_observed: string;
  people_affected: number;
  votes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface ReportComment {
  id: string;
  user_id: string;
  report_id: string;
  body: string;
  created_at: string;
  profiles?: Profile;
}

export interface ReportUpdate {
  id: string;
  author_id: string;
  report_id: string;
  status: ReportStatus | null;
  body: string;
  created_at: string;
  profiles?: Profile;
}

export interface ChatThread {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface CategoryDef {
  id: string;
  label: string;
  icon: string;
}
