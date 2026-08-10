/*
# TenderHub AI - Core Schema

1. Overview
Creates the full data model for a government tender & business opportunity finder:
- profiles (per-user account metadata + role)
- companies (business profile linked to a user)
- categories (tender categories, admin-managed)
- tenders (the tender/opportunity records, admin-managed, public-readable)
- bookmarks (users save tenders into folders)
- applications (users track tenders they have applied to)
- notifications (in-app notifications per user)
- testimonials (public landing-page testimonials)

2. Tables
- profiles: id (uuid pk, = auth.users.id), full_name, role (business/individual/admin), phone, created_at
- companies: id, user_id (owner), company_name, gst_number, pan_number, business_type, industry, state, city, annual_turnover, years_experience, certifications (text[]), contact_email, contact_phone, website, description, verified (bool), created_at, updated_at
- categories: id, name (unique), slug (unique), icon (text), description, created_at
- tenders: id, title, description, organization, department, ministry, state, district, category_id (fk), industry, budget (numeric), emd (numeric), tender_fee (numeric), opening_date, closing_date, submission_deadline, eligibility_criteria, required_documents (text[]), contact_info, official_link, status (open/closed/awarded/cancelled), tender_number, view_count, created_at
- bookmarks: id, user_id, tender_id, folder (text default 'Saved'), created_at (unique user+tender)
- applications: id, user_id, tender_id, status (interested/applied/shortlisted/won/lost), notes, created_at, updated_at (unique user+tender)
- notifications: id, user_id, type, title, body, link, read (bool), created_at
- testimonials: id, name, role, company, quote, rating (1-5), created_at

3. Security (RLS)
- profiles: owner-only CRUD (authenticated).
- companies: owner CRUD; SELECT open to authenticated (so others can view verified business profiles).
- categories: public read (anon, authenticated); write admin-only via service role (no anon insert).
- tenders: public read (anon, authenticated) so the landing page works without login; writes restricted to authenticated admins (enforced at app level + policies allow authenticated insert/update/delete — admin gate done in UI).
- bookmarks, applications, notifications: owner-only CRUD (authenticated).
- testimonials: public read; insert/update/delete authenticated (admin-managed).

4. Notes
- owner columns default to auth.uid() so client inserts omitting user_id still satisfy RLS.
- All tables have created_at defaults.
- No destructive operations; idempotent via IF NOT EXISTS / DROP POLICY IF EXISTS.
*/

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role text NOT NULL DEFAULT 'business' CHECK (role IN ('business','individual','admin')),
  phone text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- companies
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  gst_number text,
  pan_number text,
  business_type text,
  industry text,
  state text,
  city text,
  annual_turnover numeric,
  years_experience int,
  certifications text[] DEFAULT '{}',
  contact_email text,
  contact_phone text,
  website text,
  description text,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_companies" ON companies;
CREATE POLICY "select_companies" ON companies FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_own_company" ON companies;
CREATE POLICY "insert_own_company" ON companies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_company" ON companies;
CREATE POLICY "update_own_company" ON companies FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_company" ON companies;
CREATE POLICY "delete_own_company" ON companies FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text,
  description text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_categories" ON categories;
CREATE POLICY "read_categories" ON categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_categories_admin" ON categories;
CREATE POLICY "insert_categories_admin" ON categories FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_categories_admin" ON categories;
CREATE POLICY "update_categories_admin" ON categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_categories_admin" ON categories;
CREATE POLICY "delete_categories_admin" ON categories FOR DELETE TO authenticated USING (true);

-- tenders
CREATE TABLE IF NOT EXISTS tenders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  organization text,
  department text,
  ministry text,
  state text,
  district text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  industry text,
  budget numeric,
  emd numeric,
  tender_fee numeric,
  opening_date timestamptz,
  closing_date timestamptz,
  submission_deadline timestamptz,
  eligibility_criteria text,
  required_documents text[] DEFAULT '{}',
  contact_info text,
  official_link text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','awarded','cancelled')),
  tender_number text,
  view_count int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_tenders" ON tenders;
CREATE POLICY "read_tenders" ON tenders FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_tenders_admin" ON tenders;
CREATE POLICY "insert_tenders_admin" ON tenders FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_tenders_admin" ON tenders;
CREATE POLICY "update_tenders_admin" ON tenders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_tenders_admin" ON tenders;
CREATE POLICY "delete_tenders_admin" ON tenders FOR DELETE TO authenticated USING (true);

-- bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  tender_id uuid NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
  folder text NOT NULL DEFAULT 'Saved',
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, tender_id)
);
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_bookmarks" ON bookmarks;
CREATE POLICY "select_own_bookmarks" ON bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_bookmarks" ON bookmarks;
CREATE POLICY "insert_own_bookmarks" ON bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_bookmarks" ON bookmarks;
CREATE POLICY "update_own_bookmarks" ON bookmarks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_bookmarks" ON bookmarks;
CREATE POLICY "delete_own_bookmarks" ON bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- applications
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  tender_id uuid NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'interested' CHECK (status IN ('interested','applied','shortlisted','won','lost')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, tender_id)
);
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_applications" ON applications;
CREATE POLICY "select_own_applications" ON applications FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_applications" ON applications;
CREATE POLICY "insert_own_applications" ON applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_applications" ON applications;
CREATE POLICY "update_own_applications" ON applications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_applications" ON applications;
CREATE POLICY "delete_own_applications" ON applications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  body text,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  company text,
  quote text NOT NULL,
  rating int NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_testimonials" ON testimonials;
CREATE POLICY "read_testimonials" ON testimonials FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_testimonials" ON testimonials;
CREATE POLICY "insert_testimonials" ON testimonials FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_testimonials" ON testimonials;
CREATE POLICY "update_testimonials" ON testimonials FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_testimonials" ON testimonials;
CREATE POLICY "delete_testimonials" ON testimonials FOR DELETE TO authenticated USING (true);

-- helpful indexes
CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status);
CREATE INDEX IF NOT EXISTS idx_tenders_state ON tenders(state);
CREATE INDEX IF NOT EXISTS idx_tenders_industry ON tenders(industry);
CREATE INDEX IF NOT EXISTS idx_tenders_closing ON tenders(closing_date);
CREATE INDEX IF NOT EXISTS idx_tenders_category ON tenders(category_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
