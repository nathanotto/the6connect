-- Add invited_user_ids field to schedule_events table to track who has been invited

ALTER TABLE schedule_events
ADD COLUMN invited_user_ids JSONB DEFAULT '[]'::jsonb;

-- Add comment
COMMENT ON COLUMN schedule_events.invited_user_ids IS 'Array of user IDs who have been sent calendar invites';
