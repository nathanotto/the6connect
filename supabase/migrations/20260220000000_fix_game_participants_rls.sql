-- Fix: Allow game creator to insert participant records for all users
-- Previously only allowed users to insert themselves (auth.uid() = user_id)
-- but game creation inserts participant rows for all 4 members at once.

DROP POLICY "Users can insert themselves as participants" ON game_participants;

CREATE POLICY "Users can insert themselves or creator can insert all"
  ON game_participants FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM games
      WHERE id = game_id
      AND created_by_user_id = auth.uid()
    )
  );
