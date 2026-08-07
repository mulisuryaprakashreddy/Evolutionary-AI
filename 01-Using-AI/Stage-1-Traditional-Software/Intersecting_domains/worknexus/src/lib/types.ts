export type Role = 'client' | 'freelancer' | 'admin';

export type ExperienceLevel = 'Entry' | 'Intermediate' | 'Expert';
export type Availability = 'Full-time' | 'Part-time' | 'Not-available';
export type ProjectType = 'fixed' | 'hourly';
export type ProjectStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type ProposalStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type ContractStatus = 'active' | 'completed' | 'cancelled' | 'disputed';
export type PaymentStatus = 'escrow' | 'released' | 'refunded' | 'disputed';
export type TransactionType = 'credit' | 'debit';

export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  avatar_url: string;
  bio: string;
  location: string;
  is_verified: boolean;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
}

export interface FreelancerProfile {
  id: string;
  user_id: string;
  title: string;
  hourly_rate: number;
  experience_level: ExperienceLevel;
  availability: Availability;
  profile_views: number;
  created_at: string;
  updated_at: string;
}

export interface ClientProfile {
  id: string;
  user_id: string;
  company_name: string;
  website: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category_id: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  category_id: string | null;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  deadline: string | null;
  experience_level: ExperienceLevel | null;
  project_type: ProjectType;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithRelations extends Project {
  category?: Category | null;
  client?: Profile | null;
  skills?: Skill[];
  proposal_count?: number;
}

export interface Proposal {
  id: string;
  project_id: string;
  freelancer_id: string;
  cover_letter: string;
  bid_amount: number;
  estimated_days: number;
  status: ProposalStatus;
  created_at: string;
  updated_at: string;
}

export interface ProposalWithRelations extends Proposal {
  freelancer?: Profile | null;
  freelancer_profile?: FreelancerProfile | null;
  project?: Project | null;
}

export interface Contract {
  id: string;
  project_id: string;
  client_id: string;
  freelancer_id: string;
  proposal_id: string | null;
  agreed_amount: number;
  status: ContractStatus;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContractWithRelations extends Contract {
  project?: Project | null;
  client?: Profile | null;
  freelancer?: Profile | null;
  freelancer_profile?: FreelancerProfile | null;
  proposal?: Proposal | null;
  payment?: Payment | null;
  review?: Review | null;
}

export interface Message {
  id: string;
  contract_id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  attachment_url: string;
  read_at: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  contract_id: string;
  payer_id: string;
  payee_id: string;
  amount: number;
  status: PaymentStatus;
  created_at: string;
  released_at: string | null;
}

export interface Review {
  id: string;
  contract_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  body: string;
  created_at: string;
}

export interface ReviewWithRelations extends Review {
  reviewer?: Profile | null;
  contract?: Contract | null;
}

export interface Portfolio {
  id: string;
  freelancer_id: string;
  title: string;
  description: string;
  image_url: string;
  project_link: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  contract_id: string | null;
  created_at: string;
}
