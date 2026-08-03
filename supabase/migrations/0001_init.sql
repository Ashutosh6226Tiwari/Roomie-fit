-- ==============================================================================
-- RoomieMatch MVP - Initial Database Schema Migration (0001_init.sql)
-- ==============================================================================
-- DESIGN DECISION:
-- Supabase Auth already provides the `auth.users` table. Therefore, we do NOT
-- create a separate `users` table. Instead, we create a `profiles` table with
-- `user_id uuid references auth.users(id)` as the unique link.
-- Furthermore, `is_verified` and `verification_method` are moved directly onto
-- `profiles` so that student verification state and lifestyle preferences can
-- be queried atomically without needing to JOIN a separate verification table.
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    city TEXT NOT NULL,
    budget_min INTEGER NOT NULL CHECK (budget_min >= 0),
    budget_max INTEGER NOT NULL CHECK (budget_max >= budget_min),
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    preferred_roommate_gender TEXT NOT NULL CHECK (preferred_roommate_gender IN ('male', 'female', 'any')),
    sleep_schedule TEXT NOT NULL CHECK (sleep_schedule IN ('early_bird', 'night_owl', 'flexible')),
    cleanliness_level INTEGER NOT NULL CHECK (cleanliness_level BETWEEN 1 AND 5),
    food_habits TEXT NOT NULL CHECK (food_habits IN ('vegetarian', 'non_vegetarian', 'vegan', 'no_preference')),
    guest_frequency TEXT NOT NULL CHECK (guest_frequency IN ('rarely', 'occasionally', 'frequently')),
    smoking BOOLEAN NOT NULL DEFAULT false,
    move_in_month DATE NOT NULL,
    about_me TEXT CHECK (char_length(about_me) <= 500),
    actively_looking BOOLEAN NOT NULL DEFAULT true,
    actively_looking_confirmed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    found_roommate BOOLEAN NOT NULL DEFAULT false,
    photo_url TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verification_method TEXT CHECK (verification_method IN ('college_email', 'student_id_pending', NULL)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to automatically update updated_at on modification
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 2. INTERESTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_interest_pair UNIQUE (from_user_id, to_user_id),
    CONSTRAINT prevent_self_interest CHECK (from_user_id <> to_user_id)
);

-- ------------------------------------------------------------------------------
-- 3. MATCH_RESULTS TABLE (Cache table for Step 2/Step 3 computed scores)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.match_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
    explanation TEXT NOT NULL,
    computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_match_cache_pair UNIQUE (requester_id, candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_match_results_requester ON public.match_results(requester_id);
CREATE INDEX IF NOT EXISTS idx_match_results_computed_at ON public.match_results(computed_at);

-- ------------------------------------------------------------------------------
-- 4. REPORTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reported_by_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'dismissed')),
    CONSTRAINT prevent_self_reporting CHECK (reported_by_id <> reported_user_id)
);

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- --- PROFILES POLICIES ---
-- Owner can SELECT their own profile
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

-- Owner can INSERT their own profile
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Owner can UPDATE their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Verified students can SELECT other active profiles for matching
CREATE POLICY "Verified users can read active profiles for matching"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles me
            WHERE me.user_id = auth.uid() AND me.is_verified = true
        )
        AND actively_looking = true
        AND found_roommate = false
    );

-- --- VIEW FOR BROWSING (excludes email/phone raw contact fields) ---
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
    id,
    user_id,
    full_name,
    city,
    budget_min,
    budget_max,
    gender,
    preferred_roommate_gender,
    sleep_schedule,
    cleanliness_level,
    food_habits,
    guest_frequency,
    smoking,
    move_in_month,
    about_me,
    actively_looking,
    actively_looking_confirmed_at,
    found_roommate,
    photo_url,
    is_verified,
    verification_method,
    created_at,
    updated_at
FROM public.profiles;

-- --- INTERESTS POLICIES ---
-- Users can INSERT interests where from_user_id is their own auth.uid()
CREATE POLICY "Users can insert own interests"
    ON public.interests FOR INSERT
    WITH CHECK (auth.uid() = from_user_id);

-- Users can SELECT interests where they are either sender or recipient
CREATE POLICY "Users can read own interests"
    ON public.interests FOR SELECT
    USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Users can DELETE interests they sent
CREATE POLICY "Users can delete own interests"
    ON public.interests FOR DELETE
    USING (auth.uid() = from_user_id);

-- --- MATCH_RESULTS POLICIES ---
-- Requester can SELECT their cached match results
CREATE POLICY "Users can read own match results"
    ON public.match_results FOR SELECT
    USING (auth.uid() = requester_id);

-- Requester can INSERT/UPDATE their cached match results
CREATE POLICY "Users can modify own match results"
    ON public.match_results FOR ALL
    USING (auth.uid() = requester_id)
    WITH CHECK (auth.uid() = requester_id);

-- --- REPORTS POLICIES ---
-- Any authenticated user can INSERT a report as reported_by_id
CREATE POLICY "Users can create reports"
    ON public.reports FOR INSERT
    WITH CHECK (auth.uid() = reported_by_id);

-- Reports cannot be selected by non-admin users (service role bypasses RLS for admin review)
CREATE POLICY "Admins can read reports"
    ON public.reports FOR SELECT
    USING (false);
