-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX photos_user_id_idx ON photos(user_id);
CREATE INDEX photos_created_at_idx ON photos(created_at DESC);

-- Enable RLS
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all photos
CREATE POLICY "Users can view all photos"
  ON photos FOR SELECT
  USING (true);

-- Policy: Users can insert their own photos
CREATE POLICY "Users can upload their own photos"
  ON photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own photos
CREATE POLICY "Users can delete their own photos"
  ON photos FOR DELETE
  USING (auth.uid() = user_id);
