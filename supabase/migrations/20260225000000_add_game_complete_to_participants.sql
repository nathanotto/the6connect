-- Add game_complete flag to game_participants
-- Each participant can independently mark their game branch as complete.
-- When all opted-in participants have game_complete = true, the game status moves to 'completed'.

ALTER TABLE game_participants ADD COLUMN IF NOT EXISTS game_complete boolean DEFAULT false;
