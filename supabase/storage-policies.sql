-- Supabase Storage Bucket Policies
-- Run these commands in Supabase Dashboard > Storage > Policies

-- First, create the "events" bucket in Supabase Dashboard:
-- 1. Go to Storage > Create bucket
-- 2. Name: "events"
-- 3. Public: Yes
-- 4. File size limit: 5MB
-- 5. Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp

-- Then apply these policies:

-- Policy 1: Anyone can upload images (with rate limiting handled by API)
CREATE POLICY "Anyone can upload event images"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (
    bucket_id = 'events'
    AND (storage.foldername(name))[1] = 'uploads'
    AND (
      lower(storage.extension(name)) = 'jpg'
      OR lower(storage.extension(name)) = 'jpeg'
      OR lower(storage.extension(name)) = 'png'
      OR lower(storage.extension(name)) = 'webp'
    )
  );

-- Policy 2: Anyone can view images (public bucket)
CREATE POLICY "Anyone can view event images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'events');

-- Policy 3: Service role can delete images (for moderation)
CREATE POLICY "Service role can delete event images"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'events');

-- Policy 4: Service role can update images (for moderation)
CREATE POLICY "Service role can update event images"
  ON storage.objects FOR UPDATE
  TO service_role
  USING (bucket_id = 'events')
  WITH CHECK (bucket_id = 'events');


-- Bucket configuration notes:
-- - Max file size: 5MB (enforced in API route + bucket settings)
-- - Allowed types: JPG, JPEG, PNG, WebP
-- - Folder structure: events/uploads/YYYY-MM-DD/{uuid}.{ext}
-- - Rate limiting: 10 uploads per hour per IP (enforced in /api/upload)
-- - Images are stored in Supabase Storage with public URLs
-- - CDN caching: Supabase automatically serves via CDN
