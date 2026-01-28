-- Remove rating column from life_status_updates
-- The rating field has been removed from the check-in form

ALTER TABLE public.life_status_updates
  DROP COLUMN IF EXISTS rating;
