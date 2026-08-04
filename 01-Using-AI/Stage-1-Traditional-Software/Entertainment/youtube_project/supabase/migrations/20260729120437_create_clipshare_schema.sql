/*
# Create ClipShare schema (video platform)

1. New Tables
- `channels`: content creator profiles (name, handle, avatar, banner, subscribers, description)
- `videos`: uploaded videos with title, description, thumbnail, video url, views, likes, duration, category; references channels
- `comments`: viewer comments on videos; references videos
2. Security
- Enable RLS on all three tables.
- This is a public/shared content platform (no sign-in required to browse/watch/comment), so policies allow anon + authenticated to read all data and write comments. Video/channel data is admin-managed seed content (read-only via anon).
3. Indexes
- Index on videos.channel_id for channel page queries
- Index on videos.category for category filtering
- Index on videos.created_at for trending/newest sorting
- Index on comments.video_id for comment listing
*/

CREATE TABLE IF NOT EXISTS channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  handle text UNIQUE NOT NULL,
  avatar_url text NOT NULL,
  banner_url text,
  subscribers bigint NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  thumbnail_url text NOT NULL,
  video_url text NOT NULL,
  channel_id uuid NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  views bigint NOT NULL DEFAULT 0,
  likes bigint NOT NULL DEFAULT 0,
  duration text NOT NULL DEFAULT '0:00',
  category text NOT NULL DEFAULT 'All',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_avatar text NOT NULL,
  text text NOT NULL,
  likes bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_videos_channel_id ON videos(channel_id);
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_video_id ON comments(video_id);

ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- channels: public read, no public write (seed/admin managed)
DROP POLICY IF EXISTS "anon_select_channels" ON channels;
CREATE POLICY "anon_select_channels" ON channels FOR SELECT
  TO anon, authenticated USING (true);

-- videos: public read, no public write
DROP POLICY IF EXISTS "anon_select_videos" ON videos;
CREATE POLICY "anon_select_videos" ON videos FOR SELECT
  TO anon, authenticated USING (true);

-- comments: public read + write (open discussion platform)
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
