-- Add settings fields to users table

-- Profile picture URL
ALTER TABLE users
ADD COLUMN profile_picture_url TEXT;

-- Weekly digest opt-in
ALTER TABLE users
ADD COLUMN weekly_digest_enabled BOOLEAN DEFAULT true;

-- Add comments
COMMENT ON COLUMN users.profile_picture_url IS 'URL to user profile picture in Supabase Storage';
COMMENT ON COLUMN users.weekly_digest_enabled IS 'Whether user wants to receive weekly email digests';
