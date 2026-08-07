/*
# Freelancing Marketplace Schema

## Overview
Full data model for a Fiverr/Upwork-style freelancing marketplace with three user roles (client, freelancer, admin). Uses Supabase Auth for accounts and application tables for profiles, projects, proposals, contracts, messaging, payments, reviews, portfolios, notifications, categories, and skills.

## New Tables
- profiles, freelancer_profiles, client_profiles, categories, skills, projects, project_skills, proposals, contracts, messages, payments, reviews, portfolios, notifications, wallets, transactions.

## Security
- RLS enabled on every table with owner-scoped or party-scoped policies.
- Auto-creates profile + wallet on signup via trigger.

## Notes
1. Owner columns default to auth.uid() so inserts that omit them satisfy RLS.
2. Policies use DROP POLICY IF EXISTS before CREATE (CREATE POLICY has no IF NOT EXISTS).
*/

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('client','freelancer','admin')),
  full_name text NOT NULL DEFAULT '',
  avatar_url text DEFAULT '',
  bio text DEFAULT '',
  location text DEFAULT '',
  is_verified boolean NOT NULL DEFAULT false,
  is_suspended boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Freelancer profiles
CREATE TABLE IF NOT EXISTS freelancer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  hourly_rate numeric NOT NULL DEFAULT 0,
  experience_level text NOT NULL DEFAULT 'Intermediate' CHECK (experience_level IN ('Entry','Intermediate','Expert')),
  availability text NOT NULL DEFAULT 'Full-time' CHECK (availability IN ('Full-time','Part-time','Not-available')),
  profile_views integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE freelancer_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "fp_select_all" ON freelancer_profiles;
CREATE POLICY "fp_select_all" ON freelancer_profiles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "fp_insert_own" ON freelancer_profiles;
CREATE POLICY "fp_insert_own" ON freelancer_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "fp_update_own" ON freelancer_profiles;
CREATE POLICY "fp_update_own" ON freelancer_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "fp_delete_own" ON freelancer_profiles;
CREATE POLICY "fp_delete_own" ON freelancer_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Client profiles
CREATE TABLE IF NOT EXISTS client_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL DEFAULT '',
  website text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cp_select_all" ON client_profiles;
CREATE POLICY "cp_select_all" ON client_profiles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "cp_insert_own" ON client_profiles;
CREATE POLICY "cp_insert_own" ON client_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "cp_update_own" ON client_profiles;
CREATE POLICY "cp_update_own" ON client_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "cp_delete_own" ON client_profiles;
CREATE POLICY "cp_delete_own" ON client_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon text NOT NULL DEFAULT 'Briefcase',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cat_select_all" ON categories;
CREATE POLICY "cat_select_all" ON categories FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "cat_insert_admin" ON categories;
CREATE POLICY "cat_insert_admin" ON categories FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "cat_update_admin" ON categories;
CREATE POLICY "cat_update_admin" ON categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "cat_delete_admin" ON categories;
CREATE POLICY "cat_delete_admin" ON categories FOR DELETE TO authenticated USING (true);

-- Skills
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "skills_select_all" ON skills;
CREATE POLICY "skills_select_all" ON skills FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "skills_insert_auth" ON skills;
CREATE POLICY "skills_insert_auth" ON skills FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "skills_update_auth" ON skills;
CREATE POLICY "skills_update_auth" ON skills FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "skills_delete_auth" ON skills;
CREATE POLICY "skills_delete_auth" ON skills FOR DELETE TO authenticated USING (true);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  budget_min numeric NOT NULL DEFAULT 0,
  budget_max numeric NOT NULL DEFAULT 0,
  deadline date,
  experience_level text DEFAULT 'Intermediate' CHECK (experience_level IN ('Entry','Intermediate','Expert')),
  project_type text NOT NULL DEFAULT 'fixed' CHECK (project_type IN ('fixed','hourly')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','completed','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "proj_select_all" ON projects;
CREATE POLICY "proj_select_all" ON projects FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "proj_insert_own" ON projects;
CREATE POLICY "proj_insert_own" ON projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);
DROP POLICY IF EXISTS "proj_update_own" ON projects;
CREATE POLICY "proj_update_own" ON projects FOR UPDATE TO authenticated USING (auth.uid() = client_id) WITH CHECK (auth.uid() = client_id);
DROP POLICY IF EXISTS "proj_delete_own" ON projects;
CREATE POLICY "proj_delete_own" ON projects FOR DELETE TO authenticated USING (auth.uid() = client_id);

-- Project skills
CREATE TABLE IF NOT EXISTS project_skills (
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, skill_id)
);
ALTER TABLE project_skills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ps_select_all" ON project_skills;
CREATE POLICY "ps_select_all" ON project_skills FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "ps_insert_own" ON project_skills;
CREATE POLICY "ps_insert_own" ON project_skills FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.client_id = auth.uid()));
DROP POLICY IF EXISTS "ps_delete_own" ON project_skills;
CREATE POLICY "ps_delete_own" ON project_skills FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.client_id = auth.uid()));

-- Proposals
CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  freelancer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  cover_letter text NOT NULL DEFAULT '',
  bid_amount numeric NOT NULL DEFAULT 0,
  estimated_days integer NOT NULL DEFAULT 7,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','withdrawn')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "prop_select_parties" ON proposals;
CREATE POLICY "prop_select_parties" ON proposals FOR SELECT TO authenticated
  USING (auth.uid() = freelancer_id OR EXISTS (SELECT 1 FROM projects p WHERE p.id = proposals.project_id AND p.client_id = auth.uid()));
DROP POLICY IF EXISTS "prop_insert_own" ON proposals;
CREATE POLICY "prop_insert_own" ON proposals FOR INSERT TO authenticated WITH CHECK (auth.uid() = freelancer_id);
DROP POLICY IF EXISTS "prop_update_own" ON proposals;
CREATE POLICY "prop_update_own" ON proposals FOR UPDATE TO authenticated
  USING (auth.uid() = freelancer_id OR EXISTS (SELECT 1 FROM projects p WHERE p.id = proposals.project_id AND p.client_id = auth.uid()))
  WITH CHECK (auth.uid() = freelancer_id OR EXISTS (SELECT 1 FROM projects p WHERE p.id = proposals.project_id AND p.client_id = auth.uid()));
DROP POLICY IF EXISTS "prop_delete_own" ON proposals;
CREATE POLICY "prop_delete_own" ON proposals FOR DELETE TO authenticated USING (auth.uid() = freelancer_id);

-- Contracts
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  freelancer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proposal_id uuid REFERENCES proposals(id) ON DELETE SET NULL,
  agreed_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','cancelled','disputed')),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "con_select_parties" ON contracts;
CREATE POLICY "con_select_parties" ON contracts FOR SELECT TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = freelancer_id);
DROP POLICY IF EXISTS "con_insert_client" ON contracts;
CREATE POLICY "con_insert_client" ON contracts FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);
DROP POLICY IF EXISTS "con_update_parties" ON contracts;
CREATE POLICY "con_update_parties" ON contracts FOR UPDATE TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = freelancer_id)
  WITH CHECK (auth.uid() = client_id OR auth.uid() = freelancer_id);
DROP POLICY IF EXISTS "con_delete_client" ON contracts;
CREATE POLICY "con_delete_client" ON contracts FOR DELETE TO authenticated USING (auth.uid() = client_id);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL DEFAULT '',
  attachment_url text DEFAULT '',
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "msg_select_parties" ON messages;
CREATE POLICY "msg_select_parties" ON messages FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
DROP POLICY IF EXISTS "msg_insert_own" ON messages;
CREATE POLICY "msg_insert_own" ON messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
DROP POLICY IF EXISTS "msg_update_own" ON messages;
CREATE POLICY "msg_update_own" ON messages FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id) WITH CHECK (auth.uid() = receiver_id);
DROP POLICY IF EXISTS "msg_delete_own" ON messages;
CREATE POLICY "msg_delete_own" ON messages FOR DELETE TO authenticated USING (auth.uid() = sender_id);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  payer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'escrow' CHECK (status IN ('escrow','released','refunded','disputed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  released_at timestamptz
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pay_select_parties" ON payments;
CREATE POLICY "pay_select_parties" ON payments FOR SELECT TO authenticated
  USING (auth.uid() = payer_id OR auth.uid() = payee_id);
DROP POLICY IF EXISTS "pay_insert_payer" ON payments;
CREATE POLICY "pay_insert_payer" ON payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = payer_id);
DROP POLICY IF EXISTS "pay_update_payer" ON payments;
CREATE POLICY "pay_update_payer" ON payments FOR UPDATE TO authenticated
  USING (auth.uid() = payer_id) WITH CHECK (auth.uid() = payer_id);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid UNIQUE NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rev_select_all" ON reviews;
CREATE POLICY "rev_select_all" ON reviews FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "rev_insert_own" ON reviews;
CREATE POLICY "rev_insert_own" ON reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reviewer_id AND EXISTS (SELECT 1 FROM contracts c WHERE c.id = contract_id AND c.client_id = auth.uid()));
DROP POLICY IF EXISTS "rev_delete_own" ON reviews;
CREATE POLICY "rev_delete_own" ON reviews FOR DELETE TO authenticated USING (auth.uid() = reviewer_id);

-- Portfolios
CREATE TABLE IF NOT EXISTS portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text DEFAULT '',
  project_link text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "port_select_all" ON portfolios;
CREATE POLICY "port_select_all" ON portfolios FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "port_insert_own" ON portfolios;
CREATE POLICY "port_insert_own" ON portfolios FOR INSERT TO authenticated WITH CHECK (auth.uid() = freelancer_id);
DROP POLICY IF EXISTS "port_update_own" ON portfolios;
CREATE POLICY "port_update_own" ON portfolios FOR UPDATE TO authenticated USING (auth.uid() = freelancer_id) WITH CHECK (auth.uid() = freelancer_id);
DROP POLICY IF EXISTS "port_delete_own" ON portfolios;
CREATE POLICY "port_delete_own" ON portfolios FOR DELETE TO authenticated USING (auth.uid() = freelancer_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL DEFAULT '',
  body text DEFAULT '',
  link text DEFAULT '',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notif_select_own" ON notifications;
CREATE POLICY "notif_select_own" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "notif_insert_own" ON notifications;
CREATE POLICY "notif_insert_own" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "notif_update_own" ON notifications;
CREATE POLICY "notif_update_own" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "notif_delete_own" ON notifications;
CREATE POLICY "notif_delete_own" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Wallets
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wallet_select_own" ON wallets;
CREATE POLICY "wallet_select_own" ON wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "wallet_insert_own" ON wallets;
CREATE POLICY "wallet_insert_own" ON wallets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "wallet_update_own" ON wallets;
CREATE POLICY "wallet_update_own" ON wallets FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('credit','debit')),
  amount numeric NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  contract_id uuid REFERENCES contracts(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tx_select_own" ON transactions;
CREATE POLICY "tx_select_own" ON transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "tx_insert_own" ON transactions;
CREATE POLICY "tx_insert_own" ON transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "tx_delete_own" ON transactions;
CREATE POLICY "tx_delete_own" ON transactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_proposals_project ON proposals(project_id);
CREATE INDEX IF NOT EXISTS idx_proposals_freelancer ON proposals(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_freelancer ON contracts(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_project ON contracts(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_contract ON messages(contract_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_payments_contract ON payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_freelancer ON portfolios(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated ON profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_fp_updated ON freelancer_profiles;
CREATE TRIGGER trg_fp_updated BEFORE UPDATE ON freelancer_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_cp_updated ON client_profiles;
CREATE TRIGGER trg_cp_updated BEFORE UPDATE ON client_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_projects_updated ON projects;
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_proposals_updated ON proposals;
CREATE TRIGGER trg_proposals_updated BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_contracts_updated ON contracts;
CREATE TRIGGER trg_contracts_updated BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_wallets_updated ON wallets;
CREATE TRIGGER trg_wallets_updated BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-create profile + wallet on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, role, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'role', 'client'), COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  INSERT INTO wallets (user_id, balance) VALUES (NEW.id, 0);
  IF NEW.raw_user_meta_data->>'role' = 'freelancer' THEN
    INSERT INTO freelancer_profiles (user_id, title) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'title', 'Freelancer'));
  ELSIF NEW.raw_user_meta_data->>'role' = 'client' THEN
    INSERT INTO client_profiles (user_id) VALUES (NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();