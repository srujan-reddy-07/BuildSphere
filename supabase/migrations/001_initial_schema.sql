-- ============================================================
-- BuildSphere – Initial Schema Migration
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Enum Types
-- ============================================================

CREATE TYPE user_role AS ENUM ('user', 'business', 'admin');
CREATE TYPE availability_type AS ENUM ('full_time', 'part_time', 'freelance', 'internship', 'not_available');
CREATE TYPE opportunity_type AS ENUM ('job', 'internship', 'freelance', 'project');
CREATE TYPE opportunity_status AS ENUM ('open', 'closed', 'draft');
CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted');
CREATE TYPE proficiency_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- ============================================================
-- Helper: updated_at trigger function
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================
-- Tables
-- ============================================================

-- public.profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id               uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name        text,
  city             text,
  state            text,
  bio              text,
  avatar_url       text,
  availability     availability_type,
  experience_years int         NOT NULL DEFAULT 0,
  education        jsonb       NOT NULL DEFAULT '[]'::jsonb,
  social_links     jsonb       NOT NULL DEFAULT '{}'::jsonb,
  resume_url       text,
  role             user_role   NOT NULL DEFAULT 'user',
  is_verified      bool        NOT NULL DEFAULT false,
  updated_at       timestamptz NOT NULL DEFAULT NOW()
);

-- public.skills
CREATE TABLE IF NOT EXISTS public.skills (
  id         uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       text        NOT NULL UNIQUE,
  category   text,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- public.user_skills
CREATE TABLE IF NOT EXISTS public.user_skills (
  user_id    uuid             NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id   uuid             NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  proficiency proficiency_level NOT NULL DEFAULT 'beginner',
  PRIMARY KEY (user_id, skill_id)
);

-- public.businesses
CREATE TABLE IF NOT EXISTS public.businesses (
  id          uuid        PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  description text,
  website     text,
  verified    bool        NOT NULL DEFAULT false,
  logo_url    text,
  created_at  timestamptz NOT NULL DEFAULT NOW()
);

-- public.opportunities
CREATE TABLE IF NOT EXISTS public.opportunities (
  id              uuid               PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id     uuid               NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title           text               NOT NULL,
  description     text               NOT NULL,
  type            opportunity_type   NOT NULL,
  location        text,
  is_remote       bool               NOT NULL DEFAULT false,
  required_skills text[]             NOT NULL DEFAULT '{}',
  stipend_min     int,
  stipend_max     int,
  deadline        date,
  status          opportunity_status NOT NULL DEFAULT 'open',
  created_at      timestamptz        NOT NULL DEFAULT NOW(),
  updated_at      timestamptz        NOT NULL DEFAULT NOW()
);

-- public.applications
CREATE TABLE IF NOT EXISTS public.applications (
  id             uuid               PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id uuid               NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  user_id        uuid               NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  note           text,
  status         application_status NOT NULL DEFAULT 'pending',
  created_at     timestamptz        NOT NULL DEFAULT NOW(),
  updated_at     timestamptz        NOT NULL DEFAULT NOW(),
  UNIQUE (opportunity_id, user_id)
);

-- public.resources
CREATE TABLE IF NOT EXISTS public.resources (
  id          uuid             PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       text             NOT NULL,
  category    text             NOT NULL,
  difficulty  difficulty_level NOT NULL,
  url         text             NOT NULL,
  description text,
  created_at  timestamptz      NOT NULL DEFAULT NOW()
);

-- public.posts
CREATE TABLE IF NOT EXISTS public.posts (
  id         uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content    text        NOT NULL,
  likes      int         NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Trigger: auto-create profile on auth.users insert
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- updated_at triggers
-- ============================================================

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts       ENABLE ROW LEVEL SECURITY;

-- ---- profiles ----
CREATE POLICY "profiles_select_all"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- ---- skills (public read-only; authenticated users can add new skills) ----
CREATE POLICY "skills_select_all"
  ON public.skills FOR SELECT
  USING (true);

CREATE POLICY "skills_insert_authenticated"
  ON public.skills FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ---- user_skills ----
CREATE POLICY "user_skills_select_all"
  ON public.user_skills FOR SELECT
  USING (true);

CREATE POLICY "user_skills_insert_own"
  ON public.user_skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_skills_update_own"
  ON public.user_skills FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_skills_delete_own"
  ON public.user_skills FOR DELETE
  USING (auth.uid() = user_id);

-- ---- businesses ----
CREATE POLICY "businesses_select_all"
  ON public.businesses FOR SELECT
  USING (true);

-- Clients can only register businesses with verified = false (admin must verify)
CREATE POLICY "businesses_insert_own"
  ON public.businesses FOR INSERT
  WITH CHECK (auth.uid() = id AND verified = false);

CREATE POLICY "businesses_update_own"
  ON public.businesses FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger to prevent client from updating verified status to true
CREATE OR REPLACE FUNCTION public.protect_business_verified()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.verified IS DISTINCT FROM OLD.verified THEN
    -- Only allow if caller is admin or running via service role
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
      NEW.verified = OLD.verified;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_protect_business_verified ON public.businesses;
CREATE TRIGGER trigger_protect_business_verified
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_business_verified();

-- ---- opportunities ----
CREATE POLICY "opportunities_select_open"
  ON public.opportunities FOR SELECT
  USING (status = 'open');

CREATE POLICY "opportunities_insert_verified_business"
  ON public.opportunities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = auth.uid()
        AND b.verified = true
    )
  );

CREATE POLICY "opportunities_update_owner"
  ON public.opportunities FOR UPDATE
  USING (auth.uid() = business_id)
  WITH CHECK (auth.uid() = business_id);

CREATE POLICY "opportunities_delete_owner"
  ON public.opportunities FOR DELETE
  USING (auth.uid() = business_id);

-- ---- applications ----
-- Applicant can see their own applications; opportunity owner can see applications to their listings.
CREATE POLICY "applications_select_own_or_owner"
  ON public.applications FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = opportunity_id
        AND o.business_id = auth.uid()
    )
  );

-- Authenticated user can apply, but cannot apply to their own opportunity.
CREATE POLICY "applications_insert_authenticated"
  ON public.applications FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = opportunity_id
        AND o.business_id = auth.uid()
    )
  );

-- Only the opportunity owner can update application status.
CREATE POLICY "applications_update_opportunity_owner"
  ON public.applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = opportunity_id
        AND o.business_id = auth.uid()
    )
  );

-- ---- resources ----
CREATE POLICY "resources_select_all"
  ON public.resources FOR SELECT
  USING (true);

CREATE POLICY "resources_insert_admin"
  ON public.resources FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );

-- ---- posts ----
CREATE POLICY "posts_select_all"
  ON public.posts FOR SELECT
  USING (true);

CREATE POLICY "posts_insert_authenticated"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "posts_update_own"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "posts_delete_own"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);
