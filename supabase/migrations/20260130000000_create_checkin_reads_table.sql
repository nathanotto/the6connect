-- Create checkin_reads table to track which users have read each check-in
CREATE TABLE IF NOT EXISTS checkin_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  checkin_id UUID NOT NULL REFERENCES life_status_updates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(checkin_id, user_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_checkin_reads_checkin_id ON checkin_reads(checkin_id);
CREATE INDEX IF NOT EXISTS idx_checkin_reads_user_id ON checkin_reads(user_id);

-- RLS policies
ALTER TABLE checkin_reads ENABLE ROW LEVEL SECURITY;

-- Users can see all read statuses
CREATE POLICY "Users can view all read statuses"
  ON checkin_reads FOR SELECT
  USING (true);

-- Users can only mark their own reads
CREATE POLICY "Users can mark their own reads"
  ON checkin_reads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own read timestamps
CREATE POLICY "Users can update their own reads"
  ON checkin_reads FOR UPDATE
  USING (auth.uid() = user_id);
