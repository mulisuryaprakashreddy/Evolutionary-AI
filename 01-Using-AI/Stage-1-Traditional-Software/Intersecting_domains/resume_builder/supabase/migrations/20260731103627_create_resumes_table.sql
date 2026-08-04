/*
# Create resumes table

1. New Tables
- `resumes`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to authenticated user, references auth.users)
  - `title` (text, not null) - name the user gives this resume
  - `template` (text, not null, default 'modern') - which template to render
  - `data` (jsonb, not null, default '{}') - full resume content
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())
2. Security
- Enable RLS on `resumes`.
- Owner-scoped CRUD: each authenticated user can only access rows they own.
- user_id defaults to auth.uid() so inserts omitting user_id still pass WITH CHECK.
*/

CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  template text NOT NULL DEFAULT 'modern',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_resumes" ON resumes;
CREATE POLICY "select_own_resumes" ON resumes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_resumes" ON resumes;
CREATE POLICY "insert_own_resumes" ON resumes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_resumes" ON resumes;
CREATE POLICY "update_own_resumes" ON resumes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_resumes" ON resumes;
CREATE POLICY "delete_own_resumes" ON resumes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
