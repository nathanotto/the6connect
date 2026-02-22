-- Add title and description to games table
ALTER TABLE games ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE games ADD COLUMN IF NOT EXISTS description text;
