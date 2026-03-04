-- Add RLS policies for checkin_comments table
-- RLS is enabled but no policies existed, blocking all inserts

CREATE POLICY "Users can view all checkin comments"
  ON checkin_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own comments"
  ON checkin_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON checkin_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON checkin_comments FOR DELETE
  USING (auth.uid() = user_id);
