/*
# Create experiences knowledge-base schema (single-tenant, no auth)

1. Overview
This migration builds the core data model for an AI Learning Assistant platform where
users share real-world experiences and mistakes. The AI assistant analyzes these
community experiences to answer questions in natural language. The app has no sign-in
screen, so all data is intentionally public/shared and policies allow the anon role.

2. New Tables
- `categories` — top-level topics (e.g. Cooking, Programming, Travel, Finance).
  - id (uuid, pk), name (text unique), slug (text unique), description (text),
    icon (text, lucide icon name), color (text, tailwind color token), sort_order (int)
- `posts` — community-shared experiences/stories.
  - id (uuid, pk), category_id (fk -> categories), title (text), body (text),
    mistakes (text[]) — explicit list of mistakes mentioned,
    lessons (text[]) — lessons learned,
    tags (text[]) — free-form tags for semantic discovery,
    author_name (text), author_role (text, e.g. Beginner/Intermediate/Expert),
    verified (boolean default false) — trusted contributor flag,
    helpful_count (int default 0) — denormalized helpful votes,
    search_vector (tsvector) — maintained by trigger for full-text search,
    created_at (timestamptz)
- `comments` — discussion on posts.
  - id (uuid, pk), post_id (fk -> posts), author_name (text), body (text),
    helpful_count (int default 0), created_at (timestamptz)
- `votes` — helpful votes on posts (and comments).
  - id (uuid, pk), target_type (text: 'post'|'comment'), target_id (uuid),
    voter_fingerprint (text) — lightweight per-browser dedup key,
    created_at (timestamptz)
  - Unique constraint on (target_type, target_id, voter_fingerprint) to prevent double votes.

3. Indexes
- posts category_id, created_at, helpful_count
- posts GIN on tags and mistakes (array containment queries)
- posts GIN on search_vector (full-text search)
- comments post_id
- votes target lookup

4. Security
- RLS enabled on all tables.
- All tables allow anon + authenticated full CRUD because the app is intentionally
  public/shared (no sign-in screen). The `USING (true)` / `WITH CHECK (true)` is
  documented here as intentional public access, not a shortcut.

5. Notes
- search_vector on posts is maintained via a BEFORE INSERT/UPDATE trigger so full-text
  search works across title, body, and tags.
- helpful_count is maintained via an AFTER INSERT/DELETE trigger on votes.
*/

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text NOT NULL DEFAULT 'BookOpen',
  color text NOT NULL DEFAULT 'blue',
  sort_order int NOT NULL DEFAULT 0
);

-- POSTS
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  body text NOT NULL,
  mistakes text[] DEFAULT '{}',
  lessons text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  author_name text NOT NULL DEFAULT 'Anonymous',
  author_role text NOT NULL DEFAULT 'Beginner',
  verified boolean NOT NULL DEFAULT false,
  helpful_count int NOT NULL DEFAULT 0,
  search_vector tsvector,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- COMMENTS
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  author_name text NOT NULL DEFAULT 'Anonymous',
  body text NOT NULL,
  helpful_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- VOTES
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL CHECK (target_type IN ('post','comment')),
  target_id uuid NOT NULL,
  voter_fingerprint text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (target_type, target_id, voter_fingerprint)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_helpful ON posts(helpful_count DESC);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_posts_mistakes ON posts USING GIN (mistakes);
CREATE INDEX IF NOT EXISTS idx_posts_search ON posts USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_votes_target ON votes(target_type, target_id);

-- RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- categories policies (public read, anon write)
DROP POLICY IF EXISTS "anon_read_categories" ON categories;
CREATE POLICY "anon_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
CREATE POLICY "anon_insert_categories" ON categories FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_categories" ON categories;
CREATE POLICY "anon_update_categories" ON categories FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- posts policies (public)
DROP POLICY IF EXISTS "anon_select_posts" ON posts;
CREATE POLICY "anon_select_posts" ON posts FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_posts" ON posts;
CREATE POLICY "anon_insert_posts" ON posts FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_posts" ON posts;
CREATE POLICY "anon_update_posts" ON posts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_posts" ON posts;
CREATE POLICY "anon_delete_posts" ON posts FOR DELETE
  TO anon, authenticated USING (true);

-- comments policies (public)
DROP POLICY IF EXISTS "anon_select_comments" ON comments;
CREATE POLICY "anon_select_comments" ON comments FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_comments" ON comments;
CREATE POLICY "anon_insert_comments" ON comments FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_comments" ON comments;
CREATE POLICY "anon_update_comments" ON comments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_comments" ON comments;
CREATE POLICY "anon_delete_comments" ON comments FOR DELETE
  TO anon, authenticated USING (true);

-- votes policies (public)
DROP POLICY IF EXISTS "anon_select_votes" ON votes;
CREATE POLICY "anon_select_votes" ON votes FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_votes" ON votes;
CREATE POLICY "anon_insert_votes" ON votes FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_votes" ON votes;
CREATE POLICY "anon_delete_votes" ON votes FOR DELETE
  TO anon, authenticated USING (true);

-- FUNCTION: maintain search_vector on posts
CREATE OR REPLACE FUNCTION posts_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.body, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posts_search_trigger ON posts;
CREATE TRIGGER posts_search_trigger
BEFORE INSERT OR UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION posts_search_vector_update();

-- FUNCTION: maintain helpful_count on posts and comments when votes change
CREATE OR REPLACE FUNCTION recalc_helpful_count()
RETURNS TRIGGER AS $$
DECLARE
  tt text;
  tid uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    tt := NEW.target_type;
    tid := NEW.target_id;
  ELSIF TG_OP = 'DELETE' THEN
    tt := OLD.target_type;
    tid := OLD.target_id;
  ELSE
    RETURN NULL;
  END IF;

  IF tt = 'post' THEN
    UPDATE posts SET helpful_count = (
      SELECT count(*) FROM votes WHERE target_type='post' AND target_id=tid
    ) WHERE id = tid;
  ELSIF tt = 'comment' THEN
    UPDATE comments SET helpful_count = (
      SELECT count(*) FROM votes WHERE target_type='comment' AND target_id=tid
    ) WHERE id = tid;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS votes_count_trigger ON votes;
CREATE TRIGGER votes_count_trigger
AFTER INSERT OR DELETE ON votes
FOR EACH ROW EXECUTE FUNCTION recalc_helpful_count();
