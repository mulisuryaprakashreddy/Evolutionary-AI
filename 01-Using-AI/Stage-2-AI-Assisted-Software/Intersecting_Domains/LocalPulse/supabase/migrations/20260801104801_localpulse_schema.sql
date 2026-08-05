/*
# LocalPulse — Community Problem Reporting Platform Schema

1. Purpose
   AI-powered civic platform where citizens report local community problems
   and AI clusters, prioritizes, and summarizes them. Includes Community
   Health Scores, rankings, comments, votes, updates, saved reports, chat.

2. New Tables
   - profiles, reports, report_votes, report_comments, report_updates,
     saved_reports, chat_threads, chat_messages

3. Security
   - RLS on every table.
   - profiles, reports, report_comments, report_updates readable by
     anon+authenticated (public knowledge base). Writes owner-scoped.
   - report_votes, saved_reports, chat_threads, chat_messages private
     to owner.

4. Notes
   - Owner columns default to auth.uid() so frontend inserts that omit
     user_id still pass WITH CHECK.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  display_name text NOT NULL DEFAULT 'Anonymous Citizen',
  avatar_url text,
  bio text,
  role text NOT NULL DEFAULT 'citizen'
    CHECK (role IN ('citizen','ngo','government','admin')),
  organization_name text,
  verified boolean NOT NULL DEFAULT false,
  points integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_read_all" ON profiles;
CREATE POLICY "profiles_read_all" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);


CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL DEFAULT 'medium'
    CHECK (severity IN ('low','medium','high','critical')),
  status text NOT NULL DEFAULT 'reported'
    CHECK (status IN ('reported','verified','under_review','in_progress','resolved','closed','reopened')),
  recurrence text NOT NULL DEFAULT 'one_time'
    CHECK (recurrence IN ('one_time','recurring','continuous')),
  is_anonymous boolean NOT NULL DEFAULT false,
  photos text[] NOT NULL DEFAULT '{}',
  video_url text,
  country text NOT NULL,
  state text,
  district text,
  city text NOT NULL,
  village text,
  postal_code text,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  date_observed date NOT NULL DEFAULT CURRENT_DATE,
  people_affected integer NOT NULL DEFAULT 1,
  votes_count integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports_read_all" ON reports;
CREATE POLICY "reports_read_all" ON reports FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "reports_insert_own" ON reports;
CREATE POLICY "reports_insert_own" ON reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reports_update_own" ON reports;
CREATE POLICY "reports_update_own" ON reports FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reports_delete_own" ON reports;
CREATE POLICY "reports_delete_own" ON reports FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS reports_category_idx ON reports(category);
CREATE INDEX IF NOT EXISTS reports_severity_idx ON reports(severity);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status);
CREATE INDEX IF NOT EXISTS reports_city_idx ON reports(city);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS reports_votes_idx ON reports(votes_count DESC);


CREATE TABLE IF NOT EXISTS report_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, report_id)
);

ALTER TABLE report_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "votes_read_own" ON report_votes;
CREATE POLICY "votes_read_own" ON report_votes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "votes_insert_own" ON report_votes;
CREATE POLICY "votes_insert_own" ON report_votes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "votes_delete_own" ON report_votes;
CREATE POLICY "votes_delete_own" ON report_votes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);


CREATE TABLE IF NOT EXISTS report_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE report_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comments_read_all" ON report_comments;
CREATE POLICY "comments_read_all" ON report_comments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "comments_insert_own" ON report_comments;
CREATE POLICY "comments_insert_own" ON report_comments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_update_own" ON report_comments;
CREATE POLICY "comments_update_own" ON report_comments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_delete_own" ON report_comments;
CREATE POLICY "comments_delete_own" ON report_comments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS comments_report_idx ON report_comments(report_id, created_at DESC);


CREATE TABLE IF NOT EXISTS report_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  status text,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE report_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "updates_read_all" ON report_updates;
CREATE POLICY "updates_read_all" ON report_updates FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "updates_insert_own" ON report_updates;
CREATE POLICY "updates_insert_own" ON report_updates FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "updates_delete_own" ON report_updates;
CREATE POLICY "updates_delete_own" ON report_updates FOR DELETE
  TO authenticated USING (auth.uid() = author_id);

CREATE INDEX IF NOT EXISTS updates_report_idx ON report_updates(report_id, created_at DESC);


CREATE TABLE IF NOT EXISTS saved_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, report_id)
);

ALTER TABLE saved_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saved_read_own" ON saved_reports;
CREATE POLICY "saved_read_own" ON saved_reports FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_insert_own" ON saved_reports;
CREATE POLICY "saved_insert_own" ON saved_reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_delete_own" ON saved_reports;
CREATE POLICY "saved_delete_own" ON saved_reports FOR DELETE
  TO authenticated USING (auth.uid() = user_id);


CREATE TABLE IF NOT EXISTS chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New conversation',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "threads_read_own" ON chat_threads;
CREATE POLICY "threads_read_own" ON chat_threads FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "threads_insert_own" ON chat_threads;
CREATE POLICY "threads_insert_own" ON chat_threads FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "threads_delete_own" ON chat_threads;
CREATE POLICY "threads_delete_own" ON chat_threads FOR DELETE
  TO authenticated USING (auth.uid() = user_id);


CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_read_own" ON chat_messages;
CREATE POLICY "messages_read_own" ON chat_messages FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM chat_threads WHERE chat_threads.id = chat_messages.thread_id AND chat_threads.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "messages_insert_own" ON chat_messages;
CREATE POLICY "messages_insert_own" ON chat_messages FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM chat_threads WHERE chat_threads.id = chat_messages.thread_id AND chat_threads.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "messages_delete_own" ON chat_messages;
CREATE POLICY "messages_delete_own" ON chat_messages FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM chat_threads WHERE chat_threads.id = chat_messages.thread_id AND chat_threads.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS messages_thread_idx ON chat_messages(thread_id, created_at ASC);


CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, coalesce(NEW.raw_user_meta_data->>'display_name', 'Anonymous Citizen'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


CREATE OR REPLACE FUNCTION public.increment_report_vote()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.reports SET votes_count = votes_count + 1 WHERE id = NEW.report_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_report_vote()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.reports SET votes_count = GREATEST(votes_count - 1, 0) WHERE id = OLD.report_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_vote_insert ON report_votes;
CREATE TRIGGER on_vote_insert AFTER INSERT ON report_votes
  FOR EACH ROW EXECUTE FUNCTION public.increment_report_vote();

DROP TRIGGER IF EXISTS on_vote_delete ON report_votes;
CREATE TRIGGER on_vote_delete AFTER DELETE ON report_votes
  FOR EACH ROW EXECUTE FUNCTION public.decrement_report_vote();


CREATE OR REPLACE FUNCTION public.increment_report_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.reports SET comments_count = comments_count + 1 WHERE id = NEW.report_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_report_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.reports SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.report_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_comment_insert ON report_comments;
CREATE TRIGGER on_comment_insert AFTER INSERT ON report_comments
  FOR EACH ROW EXECUTE FUNCTION public.increment_report_comment();

DROP TRIGGER IF EXISTS on_comment_delete ON report_comments;
CREATE TRIGGER on_comment_delete AFTER DELETE ON report_comments
  FOR EACH ROW EXECUTE FUNCTION public.decrement_report_comment();
