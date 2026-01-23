-- the6connect Row Level Security Policies
-- Implements security rules for all tables

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_status_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- USERS TABLE POLICIES
-- =============================================================================

-- All authenticated users can view all member profiles
CREATE POLICY "Users can view all members"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);

-- Users can update only their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- =============================================================================
-- LIFE AREAS TABLE POLICIES
-- =============================================================================

-- All authenticated users can view life areas (read-only reference data)
CREATE POLICY "Anyone can view life areas"
  ON public.life_areas FOR SELECT
  TO authenticated
  USING (true);

-- =============================================================================
-- LIFE STATUS UPDATES POLICIES
-- =============================================================================

-- Users can view all life status updates (for accountability)
CREATE POLICY "Users can view all life status updates"
  ON public.life_status_updates FOR SELECT
  TO authenticated
  USING (true);

-- Users can manage (INSERT, UPDATE, DELETE) only their own life status
CREATE POLICY "Users can create own life status updates"
  ON public.life_status_updates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own life status updates"
  ON public.life_status_updates FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own life status updates"
  ON public.life_status_updates FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================================================
-- DIRECT MESSAGES POLICIES
-- =============================================================================

-- Users can only view messages where they are sender or recipient
CREATE POLICY "Users can view own messages"
  ON public.direct_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Users can send messages (create as sender)
CREATE POLICY "Users can send messages"
  ON public.direct_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Users can update messages they sent (e.g., edit) or received (e.g., mark as read)
CREATE POLICY "Users can update own messages"
  ON public.direct_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Users can delete messages they sent
CREATE POLICY "Users can delete sent messages"
  ON public.direct_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id);

-- =============================================================================
-- QUESTIONS POLICIES
-- =============================================================================

-- All users can view all questions
CREATE POLICY "Users can view all questions"
  ON public.questions FOR SELECT
  TO authenticated
  USING (true);

-- Any user can create a question
CREATE POLICY "Users can create questions"
  ON public.questions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = asked_by_user_id);

-- Users can update their own questions
CREATE POLICY "Users can update own questions"
  ON public.questions FOR UPDATE
  TO authenticated
  USING (auth.uid() = asked_by_user_id)
  WITH CHECK (auth.uid() = asked_by_user_id);

-- Users can delete their own questions
CREATE POLICY "Users can delete own questions"
  ON public.questions FOR DELETE
  TO authenticated
  USING (auth.uid() = asked_by_user_id);

-- =============================================================================
-- QUESTION ANSWERS POLICIES
-- =============================================================================

-- All users can view all answers (transparency)
CREATE POLICY "Users can view all answers"
  ON public.question_answers FOR SELECT
  TO authenticated
  USING (true);

-- Users can create their own answers
CREATE POLICY "Users can create own answers"
  ON public.question_answers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own answers
CREATE POLICY "Users can update own answers"
  ON public.question_answers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own answers
CREATE POLICY "Users can delete own answers"
  ON public.question_answers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================================================
-- AI EXCHANGES POLICIES
-- =============================================================================

-- Users can view all shared AI exchanges
CREATE POLICY "Users can view shared AI exchanges"
  ON public.ai_exchanges FOR SELECT
  TO authenticated
  USING (is_shared = true OR auth.uid() = user_id);

-- Users can create their own AI exchanges
CREATE POLICY "Users can create own AI exchanges"
  ON public.ai_exchanges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own AI exchanges
CREATE POLICY "Users can update own AI exchanges"
  ON public.ai_exchanges FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own AI exchanges
CREATE POLICY "Users can delete own AI exchanges"
  ON public.ai_exchanges FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================================================
-- PERSONAL SUMMARIES POLICIES
-- =============================================================================

-- All users can view all summaries (for group accountability)
CREATE POLICY "Users can view all summaries"
  ON public.personal_summaries FOR SELECT
  TO authenticated
  USING (true);

-- Service role or user can insert summaries
CREATE POLICY "Service can create summaries"
  ON public.personal_summaries FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Generated by backend API with auth check

-- Users can view/update their own summaries
CREATE POLICY "Users can update own summaries"
  ON public.personal_summaries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- SCHEDULE EVENTS POLICIES
-- =============================================================================

-- All users can view all events
CREATE POLICY "Users can view all events"
  ON public.schedule_events FOR SELECT
  TO authenticated
  USING (true);

-- Any user can create events
CREATE POLICY "Users can create events"
  ON public.schedule_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by_user_id);

-- Users can update events they created
CREATE POLICY "Users can update own events"
  ON public.schedule_events FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by_user_id)
  WITH CHECK (auth.uid() = created_by_user_id);

-- Users can delete events they created
CREATE POLICY "Users can delete own events"
  ON public.schedule_events FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by_user_id);

-- =============================================================================
-- SCHEDULE RESPONSES POLICIES
-- =============================================================================

-- All users can view all responses
CREATE POLICY "Users can view all responses"
  ON public.schedule_responses FOR SELECT
  TO authenticated
  USING (true);

-- Users can create their own responses
CREATE POLICY "Users can create own responses"
  ON public.schedule_responses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own responses
CREATE POLICY "Users can update own responses"
  ON public.schedule_responses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own responses
CREATE POLICY "Users can delete own responses"
  ON public.schedule_responses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================================================
-- COMMITMENTS POLICIES
-- =============================================================================

-- All users can view all commitments (public accountability)
CREATE POLICY "Users can view all commitments"
  ON public.commitments FOR SELECT
  TO authenticated
  USING (true);

-- Users can create their own commitments
CREATE POLICY "Users can create own commitments"
  ON public.commitments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own commitments
CREATE POLICY "Users can update own commitments"
  ON public.commitments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own commitments
CREATE POLICY "Users can delete own commitments"
  ON public.commitments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================================================
-- ACTIVITY LOG POLICIES
-- =============================================================================

-- All users can view all activity (transparency)
CREATE POLICY "Users can view all activity"
  ON public.activity_log FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can insert activity (via backend)
CREATE POLICY "Service can create activity logs"
  ON public.activity_log FOR INSERT
  TO authenticated
  WITH CHECK (true);
