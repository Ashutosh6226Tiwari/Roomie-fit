-- ==============================================================================
-- 0005_status_toggles.sql
-- Add found_roommate_at column and index for status toggles & 30-day expiry (§3.2, §3.7)
-- ==============================================================================

-- 1. Add found_roommate_at column to public.profiles if not exists
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS found_roommate_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Create index on status fields for fast matching queries & expiry sweeps
CREATE INDEX IF NOT EXISTS idx_profiles_status_looking 
ON public.profiles(actively_looking, is_verified, found_roommate, actively_looking_confirmed_at);

-- 3. Update public_profiles view to include found_roommate_at
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
    found_roommate_at,
    photo_url,
    is_verified,
    verification_method,
    created_at,
    updated_at
FROM public.profiles;
