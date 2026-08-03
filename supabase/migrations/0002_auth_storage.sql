-- ==============================================================================
-- RoomieMatch MVP - Auth & Storage Migration (0002_auth_storage.sql)
-- ==============================================================================
-- 1. Create private bucket 'student-ids' in Supabase Storage
-- 2. Create Postgres trigger on auth.users to auto-create public.profiles
-- ==============================================================================

-- Create 'student-ids' private storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'student-ids',
    'student-ids',
    false,
    5242880, -- 5MB file limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE
SET public = false;

-- Policies for student-ids bucket
DROP POLICY IF EXISTS "Users can upload own student ID" ON storage.objects;
CREATE POLICY "Users can upload own student ID"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'student-ids'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can read own student ID" ON storage.objects;
CREATE POLICY "Users can read own student ID"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'student-ids'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Service role full access to student-ids" ON storage.objects;
CREATE POLICY "Service role full access to student-ids"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'student-ids')
WITH CHECK (bucket_id = 'student-ids');

-- ------------------------------------------------------------------------------
-- AUTO-CREATE PROFILE TRIGGER
-- Automatically create profile row in public.profiles when user signs up
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_domain TEXT;
    v_is_verified BOOLEAN := false;
    v_method TEXT := null;
    v_full_name TEXT;
BEGIN
    v_domain := lower(split_part(NEW.email, '@', 2));
    v_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );

    -- Check verification status from metadata if provided, otherwise default by domain
    IF COALESCE((NEW.raw_user_meta_data->>'is_verified')::boolean, false) = true THEN
        v_is_verified := true;
        v_method := COALESCE(NEW.raw_user_meta_data->>'verification_method', 'college_email');
    ELSIF v_domain = 'college.edu' THEN
        v_is_verified := true;
        v_method := 'college_email';
    ELSE
        v_is_verified := false;
        v_method := COALESCE(NEW.raw_user_meta_data->>'verification_method', 'student_id_pending');
    END IF;

    INSERT INTO public.profiles (
        user_id,
        full_name,
        email,
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
        is_verified,
        verification_method
    )
    VALUES (
        NEW.id,
        v_full_name,
        NEW.email,
        'Campus City',
        500,
        1500,
        'other',
        'any',
        'flexible',
        3,
        'no_preference',
        'occasionally',
        false,
        CURRENT_DATE,
        v_is_verified,
        v_method
    )
    ON CONFLICT (user_id) DO UPDATE
    SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        is_verified = EXCLUDED.is_verified,
        verification_method = EXCLUDED.verification_method,
        updated_at = now();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger cleanly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
