-- Fix: Add UPDATE policy to games table
-- The activate route updates game status to 'active' but no UPDATE policy existed,
-- causing RLS to silently block it and .single() to throw.

CREATE POLICY "Game creator can update their game"
  ON games FOR UPDATE
  USING (auth.uid() = created_by_user_id);
