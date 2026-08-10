export type TenderStatus = 'open' | 'closed' | 'awarded' | 'cancelled'
export type UserRole = 'business' | 'individual' | 'admin'
export type ApplicationStatus = 'interested' | 'applied' | 'shortlisted' | 'won' | 'lost'

export interface Profile {
  id: string
  full_name: string | null
  role: UserRole
  phone: string | null
  created_at: string
}

export interface Company {
  id: string
  user_id: string
  company_name: string
  gst_number: string | null
  pan_number: string | null
  business_type: string | null
  industry: string | null
  state: string | null
  city: string | null
  annual_turnover: number | null
  years_experience: number | null
  certifications: string[]
  contact_email: string | null
  contact_phone: string | null
  website: string | null
  description: string | null
  verified: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
}

export interface Tender {
  id: string
  title: string
  description: string | null
  organization: string | null
  department: string | null
  ministry: string | null
  state: string | null
  district: string | null
  category_id: string | null
  industry: string | null
  budget: number | null
  emd: number | null
  tender_fee: number | null
  opening_date: string | null
  closing_date: string | null
  submission_deadline: string | null
  eligibility_criteria: string | null
  required_documents: string[]
  contact_info: string | null
  official_link: string | null
  status: TenderStatus
  tender_number: string | null
  view_count: number
  created_at: string
  category?: Category | null
}

export interface Bookmark {
  id: string
  user_id: string
  tender_id: string
  folder: string
  created_at: string
  tender?: Tender
}

export interface Application {
  id: string
  user_id: string
  tender_id: string
  status: ApplicationStatus
  notes: string | null
  created_at: string
  updated_at: string
  tender?: Tender
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string | null
  link: string | null
  read: boolean
  created_at: string
}

export interface Testimonial {
  id: string
  name: string
  role: string | null
  company: string | null
  quote: string
  rating: number
}

export interface TenderWithScore extends Tender {
  score: number
  reasons: string[]
}
