-- Update Life Status (Check-ins) Schema
-- Changes:
-- 1. Update life_areas with new zones (Mission, Relationship, Family, Health, Everything, Other)
-- 2. Rename mood_rating to rating in life_status_updates
-- 3. Add status_other column for custom status text
-- 4. Add support_type and support_type_other columns

-- First, update existing life areas with new zone names
-- Keep the same UUIDs for data consistency
UPDATE public.life_areas SET
  name = 'Mission',
  description = 'Purpose, career, business, and professional development',
  icon = 'Target'
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE public.life_areas SET
  name = 'Relationship',
  description = 'Romantic relationships, dating, and partnership',
  icon = 'Heart'
WHERE id = '22222222-2222-2222-2222-222222222222';

UPDATE public.life_areas SET
  name = 'Family',
  description = 'Family connections, parenting, and home life',
  icon = 'Home'
WHERE id = '33333333-3333-3333-3333-333333333333';

UPDATE public.life_areas SET
  name = 'Health',
  description = 'Physical health, fitness, nutrition, and wellbeing',
  icon = 'Activity'
WHERE id = '44444444-4444-4444-4444-444444444444';

-- Add two new zones
INSERT INTO public.life_areas (id, name, description, icon, sort_order) VALUES
  (
    '55555555-5555-5555-5555-555555555555',
    'Everything',
    'Overall life satisfaction and general check-in',
    'Circle',
    5
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    'Other',
    'Custom zone for specific topics or areas',
    'MoreHorizontal',
    6
  );

-- Now update life_status_updates table
-- Rename mood_rating column to rating
ALTER TABLE public.life_status_updates
  RENAME COLUMN mood_rating TO rating;

-- Add new columns
ALTER TABLE public.life_status_updates
  ADD COLUMN status_other TEXT,
  ADD COLUMN support_type TEXT CHECK (support_type IN ('Listen', 'Support', 'Advise', 'Hug Me', 'Other')),
  ADD COLUMN support_type_other TEXT;

-- Update the status field to handle new values
-- Remove the old check constraint if it exists and add comment for new valid values
COMMENT ON COLUMN public.life_status_updates.status IS 'Valid values: Anxious, Pissed Off, Meh, Optimistic, Solid, On Fire, Other. If Other, status_other should contain custom text.';

COMMENT ON COLUMN public.life_status_updates.rating IS '1-10 rating scale for overall feeling';

COMMENT ON COLUMN public.life_status_updates.support_type IS 'Type of support requested: Listen, Support, Advise, Hug Me, Other. If Other, support_type_other should contain custom text.';
