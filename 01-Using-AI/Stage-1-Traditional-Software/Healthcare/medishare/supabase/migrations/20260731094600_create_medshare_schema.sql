/*
# MedShare — Core schema

1. New Tables
- `profiles` — public profile data for each auth user (full name, phone, organization flags, verification).
- `listings` — medical equipment donation/loan listings created by donors.
- `favorites` — saved listings per recipient.
- `reports` — user reports against a listing (spam, fake, unsafe).
2. Security
- Enable RLS on every table.
- profiles: owner can read/update own row; anyone can read the public profile columns via a limited SELECT (we expose only verification + names). For simplicity here, SELECT is owner-only for full row; listings join exposes public fields.
- listings: SELECT is public (anyone can browse); INSERT/UPDATE/DELETE are owner-only.
- favorites: owner-only CRUD.
- reports: owner can insert & read own; listing owner cannot delete others' reports.
3. Notes
- `listings.images` is a text[] of public URLs (no storage bucket used in this build).
- Owner columns default to auth.uid() so client inserts omitting user_id still satisfy WITH CHECK.
*/

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  is_organization boolean NOT NULL DEFAULT false,
  organization_name text,
  organization_type text,
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_own_profile" ON profiles;
CREATE POLICY "read_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- listings
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  equipment_name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL DEFAULT '',
  condition text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  images text[] NOT NULL DEFAULT '{}',
  country text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  postal_code text NOT NULL DEFAULT '',
  pickup_available boolean NOT NULL DEFAULT true,
  shipping_available boolean NOT NULL DEFAULT false,
  shipping_cost text,
  donation_type text NOT NULL DEFAULT 'donate',
  availability text NOT NULL DEFAULT 'immediate',
  available_date date,
  expected_return_date date,
  contact_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  preferred_contact text NOT NULL DEFAULT 'Email',
  notes text,
  status text NOT NULL DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_listings" ON listings;
CREATE POLICY "public_read_listings" ON listings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_listings" ON listings;
CREATE POLICY "insert_own_listings" ON listings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = donor_id);

DROP POLICY IF EXISTS "update_own_listings" ON listings;
CREATE POLICY "update_own_listings" ON listings FOR UPDATE
  TO authenticated USING (auth.uid() = donor_id) WITH CHECK (auth.uid() = donor_id);

DROP POLICY IF EXISTS "delete_own_listings" ON listings;
CREATE POLICY "delete_own_listings" ON listings FOR DELETE
  TO authenticated USING (auth.uid() = donor_id);

CREATE INDEX IF NOT EXISTS listings_category_idx ON listings (category);
CREATE INDEX IF NOT EXISTS listings_status_idx ON listings (status);
CREATE INDEX IF NOT EXISTS listings_created_at_idx ON listings (created_at DESC);
CREATE INDEX IF NOT EXISTS listings_donor_idx ON listings (donor_id);

-- favorites
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, listing_id)
);
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_favorites" ON favorites;
CREATE POLICY "select_own_favorites" ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_favorites" ON favorites;
CREATE POLICY "insert_own_favorites" ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_favorites" ON favorites;
CREATE POLICY "delete_own_favorites" ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS favorites_user_idx ON favorites (user_id);

-- reports
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  details text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_own_reports" ON reports;
CREATE POLICY "insert_own_reports" ON reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "select_own_reports" ON reports;
CREATE POLICY "select_own_reports" ON reports FOR SELECT
  TO authenticated USING (auth.uid() = reporter_id);

-- updated_at trigger for listings
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS listings_set_updated_at ON listings;
CREATE TRIGGER listings_set_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
