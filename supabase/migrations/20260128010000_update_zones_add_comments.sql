-- Update Check-ins to support multiple zones and add comments
-- Changes:
-- 1. Change life_area_id to zone_ids (array of UUIDs)
-- 2. Add zone_other field for custom zone text
-- 3. Create checkin_comments table

-- Ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add new columns for multiple zones
ALTER TABLE public.life_status_updates
  ADD COLUMN zone_ids UUID[] NOT NULL DEFAULT '{}',
  ADD COLUMN zone_other TEXT;

-- Migrate existing single zone data to array format
UPDATE public.life_status_updates
SET zone_ids = ARRAY[life_area_id]
WHERE life_area_id IS NOT NULL;

-- Drop the old single zone column
ALTER TABLE public.life_status_updates
  DROP COLUMN life_area_id;

-- Create checkin_comments table
CREATE TABLE public.checkin_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkin_id UUID NOT NULL REFERENCES public.life_status_updates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for efficient comment queries
CREATE INDEX idx_checkin_comments_checkin_created
  ON public.checkin_comments(checkin_id, created_at DESC);

CREATE INDEX idx_checkin_comments_user
  ON public.checkin_comments(user_id, created_at DESC);

-- Apply updated_at trigger to checkin_comments
CREATE TRIGGER update_checkin_comments_updated_at
  BEFORE UPDATE ON public.checkin_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update the index for life_status_updates since we changed the column
DROP INDEX IF EXISTS idx_life_status_user_area_created;
CREATE INDEX idx_life_status_user_created
  ON public.life_status_updates(user_id, created_at DESC);
