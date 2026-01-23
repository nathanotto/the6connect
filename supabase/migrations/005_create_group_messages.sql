/**
 * Create Group Messages Table
 *
 * Table for group chat messages visible to all 4 members
 */

-- Create or replace the update_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create group_messages table
CREATE TABLE public.group_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for efficient message lookups
CREATE INDEX idx_group_messages_created
  ON public.group_messages(created_at DESC);

-- Add updated_at trigger
CREATE TRIGGER update_group_messages_updated_at
  BEFORE UPDATE ON public.group_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies: All authenticated users can read all group messages
CREATE POLICY "All users can view group messages"
  ON public.group_messages FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies: All authenticated users can create group messages
CREATE POLICY "All users can create group messages"
  ON public.group_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- RLS Policies: Users can only update their own messages
CREATE POLICY "Users can update own group messages"
  ON public.group_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id);

-- RLS Policies: Users can only delete their own messages
CREATE POLICY "Users can delete own group messages"
  ON public.group_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id);
