-- ==============================================================================
-- RoomieMatch MVP - Profile Photos Storage Migration (0004_profile_photos.sql)
-- ==============================================================================
-- 1. Create public bucket 'profile-photos' in Supabase Storage
-- 2. Add RLS policies for authenticated users to upload/update their own photo
-- 3. Add RLS policy for public read access to profile photos
-- ==============================================================================

-- Create 'profile-photos' public storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-photos',
    'profile-photos',
    true,
    5242880, -- 5MB file limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE
SET public = true, file_size_limit = 5242880;

-- Policies for profile-photos bucket
DROP POLICY IF EXISTS "Authenticated users can upload profile photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload profile photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Authenticated users can update own profile photos" ON storage.objects;
CREATE POLICY "Authenticated users can update own profile photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Authenticated users can delete own profile photos" ON storage.objects;
CREATE POLICY "Authenticated users can delete own profile photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Anyone can view profile photos" ON storage.objects;
CREATE POLICY "Anyone can view profile photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "Service role full access to profile-photos" ON storage.objects;
CREATE POLICY "Service role full access to profile-photos"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'profile-photos')
WITH CHECK (bucket_id = 'profile-photos');
