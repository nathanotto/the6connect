-- Clear all existing check-in data to start fresh
-- This deletes all records from life_status_updates and related comments

-- Delete all checkin comments first (foreign key constraint)
DELETE FROM public.checkin_comments;

-- Delete all check-ins
DELETE FROM public.life_status_updates;
