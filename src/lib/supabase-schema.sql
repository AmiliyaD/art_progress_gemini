-- ============================================================================
-- ART//PROGRESS — REFINED & NORMALIZED SUPABASE POSTGRESQL SCHEMA
-- ============================================================================
-- Single source of truth architecture:
--   1. profiles: auth.users(id) PK, no duplicated user_id, clean onboarding fields
--   2. sessions: drawing sessions & duration timers
--   3. challenges: multi-day drawing challenges (tasks decoupled into challenge_tasks)
--   4. challenge_tasks: single source of truth for all challenge tasks
--   5. artworks: gallery records, metadata & private storage references
--   6. insights: studio journal & cross-entity reflections
--   7. user_achievements: achievement progression & unlock timestamps
--   8. storage.buckets: PRIVATE 'artworks' bucket with authenticated owner-only RLS
--   9. handle_new_user: minimal baseline trigger with NO dummy/fake goals
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  drawing_experience TEXT NOT NULL DEFAULT '3–5 years',
  custom_drawing_experience TEXT,
  goals TEXT[] NOT NULL DEFAULT '{}',
  custom_goals TEXT[] NOT NULL DEFAULT '{}',
  migrated_from_local BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);

-- ============================================================================
-- 2. SESSIONS TABLE (Drawing practice timer sessions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  topics TEXT[] NOT NULL DEFAULT '{}',
  goal TEXT,
  session_type TEXT NOT NULL DEFAULT 'free', -- 'free' | 'timed'
  time_limit BIGINT, -- ms limit for timed sessions
  expires_at BIGINT, -- expiration timestamp ms for timed sessions
  status TEXT NOT NULL DEFAULT 'completed', -- 'active' | 'paused' | 'completed' | 'expired'
  started_at BIGINT NOT NULL,
  paused_at BIGINT,
  total_paused_duration BIGINT NOT NULL DEFAULT 0,
  completed_at BIGINT,
  duration BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotent column migrations for existing instances
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS session_type TEXT NOT NULL DEFAULT 'free';
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS time_limit BIGINT;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS expires_at BIGINT;

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON public.sessions(started_at DESC);

-- ============================================================================
-- 3. CHALLENGES TABLE (Challenges metadata - tasks stored in challenge_tasks)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.challenges (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT,
  duration TEXT NOT NULL DEFAULT '30 days',
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'paused' | 'completed'
  accent TEXT NOT NULL DEFAULT '#f59e0b',
  daily_goal TEXT,
  completed_at BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenges_user_id ON public.challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON public.challenges(status);

-- ============================================================================
-- 4. CHALLENGE TASKS TABLE (Single source of truth for challenge tasks)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.challenge_tasks (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at BIGINT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenge_tasks_challenge_id ON public.challenge_tasks(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_tasks_user_id ON public.challenge_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_tasks_sort ON public.challenge_tasks(challenge_id, sort_order ASC);

-- ============================================================================
-- 5. ARTWORKS TABLE (Gallery artworks & metadata)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.artworks (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  topics TEXT[] NOT NULL DEFAULT '{}',
  duration_ms BIGINT NOT NULL DEFAULT 0,
  date TEXT NOT NULL,
  mood TEXT,
  notes TEXT,
  source_session_id TEXT REFERENCES public.sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artworks_user_id ON public.artworks(user_id);
CREATE INDEX IF NOT EXISTS idx_artworks_date ON public.artworks(date DESC);

-- ============================================================================
-- 6. INSIGHTS TABLE (Studio journal, notes & reflections)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.insights (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  related_artwork_id TEXT REFERENCES public.artworks(id) ON DELETE SET NULL,
  related_challenge_id TEXT REFERENCES public.challenges(id) ON DELETE SET NULL,
  related_session_id TEXT REFERENCES public.sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insights_user_id ON public.insights(user_id);

-- ============================================================================
-- 7. USER ACHIEVEMENTS TABLE (Progress & milestone tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  unlocked_at BIGINT,
  current_value BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) ENABLEMENT
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES (Explicit CRUD operations for authenticated owners)
-- ============================================================================

-- 1. Profiles (auth.uid() = id)
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE TO authenticated USING (auth.uid() = id);

-- 2. Sessions (auth.uid() = user_id)
DROP POLICY IF EXISTS "sessions_select_own" ON public.sessions;
CREATE POLICY "sessions_select_own" ON public.sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "sessions_insert_own" ON public.sessions;
CREATE POLICY "sessions_insert_own" ON public.sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "sessions_update_own" ON public.sessions;
CREATE POLICY "sessions_update_own" ON public.sessions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "sessions_delete_own" ON public.sessions;
CREATE POLICY "sessions_delete_own" ON public.sessions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 3. Challenges (auth.uid() = user_id)
DROP POLICY IF EXISTS "challenges_select_own" ON public.challenges;
CREATE POLICY "challenges_select_own" ON public.challenges
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "challenges_insert_own" ON public.challenges;
CREATE POLICY "challenges_insert_own" ON public.challenges
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "challenges_update_own" ON public.challenges;
CREATE POLICY "challenges_update_own" ON public.challenges
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "challenges_delete_own" ON public.challenges;
CREATE POLICY "challenges_delete_own" ON public.challenges
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 4. Challenge Tasks (auth.uid() = user_id)
DROP POLICY IF EXISTS "challenge_tasks_select_own" ON public.challenge_tasks;
CREATE POLICY "challenge_tasks_select_own" ON public.challenge_tasks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "challenge_tasks_insert_own" ON public.challenge_tasks;
CREATE POLICY "challenge_tasks_insert_own" ON public.challenge_tasks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "challenge_tasks_update_own" ON public.challenge_tasks;
CREATE POLICY "challenge_tasks_update_own" ON public.challenge_tasks
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "challenge_tasks_delete_own" ON public.challenge_tasks;
CREATE POLICY "challenge_tasks_delete_own" ON public.challenge_tasks
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 5. Artworks (auth.uid() = user_id)
DROP POLICY IF EXISTS "artworks_select_own" ON public.artworks;
CREATE POLICY "artworks_select_own" ON public.artworks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "artworks_insert_own" ON public.artworks;
CREATE POLICY "artworks_insert_own" ON public.artworks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "artworks_update_own" ON public.artworks;
CREATE POLICY "artworks_update_own" ON public.artworks
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "artworks_delete_own" ON public.artworks;
CREATE POLICY "artworks_delete_own" ON public.artworks
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 6. Insights (auth.uid() = user_id)
DROP POLICY IF EXISTS "insights_select_own" ON public.insights;
CREATE POLICY "insights_select_own" ON public.insights
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insights_insert_own" ON public.insights;
CREATE POLICY "insights_insert_own" ON public.insights
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "insights_update_own" ON public.insights;
CREATE POLICY "insights_update_own" ON public.insights
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "insights_delete_own" ON public.insights;
CREATE POLICY "insights_delete_own" ON public.insights
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 7. User Achievements (auth.uid() = user_id)
DROP POLICY IF EXISTS "user_achievements_select_own" ON public.user_achievements;
CREATE POLICY "user_achievements_select_own" ON public.user_achievements
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_achievements_insert_own" ON public.user_achievements;
CREATE POLICY "user_achievements_insert_own" ON public.user_achievements
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_achievements_update_own" ON public.user_achievements;
CREATE POLICY "user_achievements_update_own" ON public.user_achievements
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_achievements_delete_own" ON public.user_achievements;
CREATE POLICY "user_achievements_delete_own" ON public.user_achievements
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================================
-- 8. PRIVATE SUPABASE STORAGE BUCKET & AUTHENTICATED USER-ONLY RLS
-- ============================================================================

-- Create 'artworks' private storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'artworks',
  'artworks',
  false,
  20971520, -- 20MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Storage object policies: Authenticated users can ONLY access files in their own folder: {user_id}/{filename}
DROP POLICY IF EXISTS "artworks_storage_select_own" ON storage.objects;
CREATE POLICY "artworks_storage_select_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'artworks' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "artworks_storage_insert_own" ON storage.objects;
CREATE POLICY "artworks_storage_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'artworks' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "artworks_storage_update_own" ON storage.objects;
CREATE POLICY "artworks_storage_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'artworks' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'artworks' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "artworks_storage_delete_own" ON storage.objects;
CREATE POLICY "artworks_storage_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'artworks' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================================
-- 9. MINIMAL AUTH TRIGGER FOR NEW REGISTRATIONS (NO DUMMY GOALS)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    name,
    drawing_experience,
    goals,
    custom_goals
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'Artist'),
    COALESCE(NEW.raw_user_meta_data->>'drawing_experience', '3–5 years'),
    '{}',
    '{}'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
