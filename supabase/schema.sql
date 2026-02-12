-- 뼈갈단 (Bonesquad) Database Schema
-- Run this SQL in Supabase SQL Editor to set up the database

-- ============================================
-- 1. TABLES
-- ============================================

-- 1. profiles (멤버 정보) - Supabase Auth와 연동
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  avatar_style TEXT DEFAULT 'notionists',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. weekly_logs (주간 성과)
CREATE TABLE IF NOT EXISTS weekly_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  content JSONB NOT NULL DEFAULT '{"items": []}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 3. feeds (SNS 피드)
CREATE TABLE IF NOT EXISTS feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. comments (댓글)
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id UUID REFERENCES feeds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. groups (스터디 그룹 메타 정보)
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. group_members (그룹 가입 현황)
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- 7. group_posts (그룹 게시물)
CREATE TABLE IF NOT EXISTS group_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. diet_logs (다이어트 그룹용 로그)
CREATE TABLE IF NOT EXISTS diet_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  breakfast TEXT,
  lunch TEXT,
  dinner TEXT,
  snack TEXT,
  exercise TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ============================================
-- 2. INDEXES for better query performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_weekly_logs_user_date ON weekly_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_weekly_logs_date ON weekly_logs(date);
CREATE INDEX IF NOT EXISTS idx_feeds_user_id ON feeds(user_id);
CREATE INDEX IF NOT EXISTS idx_feeds_created_at ON feeds(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_feed_id ON comments(feed_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_group_id ON group_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_diet_logs_user_date ON diet_logs(user_id, date);

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. RLS POLICIES
-- ============================================

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Weekly logs policies
CREATE POLICY "Weekly logs are viewable by everyone"
  ON weekly_logs FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own weekly logs"
  ON weekly_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly logs"
  ON weekly_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekly logs"
  ON weekly_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Feeds policies
CREATE POLICY "Feeds are viewable by everyone"
  ON feeds FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own feeds"
  ON feeds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feeds"
  ON feeds FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feeds"
  ON feeds FOR DELETE
  USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- Groups policies (read-only for users, admin manages)
CREATE POLICY "Groups are viewable by everyone"
  ON groups FOR SELECT
  USING (true);

-- Group members policies
CREATE POLICY "Group members are viewable by everyone"
  ON group_members FOR SELECT
  USING (true);

CREATE POLICY "Users can join groups"
  ON group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON group_members FOR DELETE
  USING (auth.uid() = user_id);

-- Group posts policies
CREATE POLICY "Group posts are viewable by everyone"
  ON group_posts FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own group posts"
  ON group_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own group posts"
  ON group_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own group posts"
  ON group_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Diet logs policies
CREATE POLICY "Diet logs are viewable by everyone"
  ON diet_logs FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own diet logs"
  ON diet_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diet logs"
  ON diet_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diet logs"
  ON diet_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_logs_updated_at
  BEFORE UPDATE ON weekly_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feeds_updated_at
  BEFORE UPDATE ON feeds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_posts_updated_at
  BEFORE UPDATE ON group_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diet_logs_updated_at
  BEFORE UPDATE ON diet_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_style)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'notionists'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 6. INITIAL DATA (Groups)
-- ============================================

INSERT INTO groups (name, description, emoji) VALUES
  ('오픽', '오픽(OPIc) 스터디 그룹', '🗣️'),
  ('다이어트', '다이어트 & 건강 관리 그룹', '🥗')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 7. ENABLE REALTIME (Optional)
-- ============================================

-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE feeds;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE weekly_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE group_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE diet_logs;
