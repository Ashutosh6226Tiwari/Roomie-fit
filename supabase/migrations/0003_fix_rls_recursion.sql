-- ==============================================================================
-- RoomieMatch MVP - Fix RLS Recursion on Profiles (0003_fix_rls_recursion.sql)
-- ==============================================================================
-- Resolves Postgres error 42P17 (infinite recursion detected in policy for relation "profiles")
-- by creating a SECURITY DEFINER function for checking verification status without recursion.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.is_verified_user()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND is_verified = true
  );
$$ LANGUAGE sql STABLE;

DROP POLICY IF EXISTS "Verified users can read active profiles for matching" ON public.profiles;
CREATE POLICY "Verified users can read active profiles for matching"
    ON public.profiles FOR SELECT
    USING (
        auth.uid() = user_id
        OR (
            public.is_verified_user()
            AND actively_looking = true
            AND found_roommate = false
        )
    );
