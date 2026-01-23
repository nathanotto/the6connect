-- the6connect Initial Database Schema
-- Creates all core tables for the men's accountability platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
-- Extends Supabase auth.users with profile information
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- LIFE AREAS TABLE
-- Predefined categories for life status tracking
CREATE TABLE public.life_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- LIFE STATUS UPDATES TABLE
-- Track user status across different life areas over time
CREATE TABLE public.life_status_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  life_area_id UUID NOT NULL REFERENCES public.life_areas(id) ON DELETE CASCADE,
  status TEXT NOT NULL, -- e.g., "struggling", "maintaining", "thriving", or numeric 1-10
  notes TEXT,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for efficient queries
CREATE INDEX idx_life_status_user_area_created
  ON public.life_status_updates(user_id, life_area_id, created_at DESC);

-- DIRECT MESSAGES TABLE
-- Private 1-on-1 messaging between members
CREATE TABLE public.direct_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for efficient message queries
CREATE INDEX idx_messages_sender_recipient
  ON public.direct_messages(sender_id, recipient_id, created_at DESC);
CREATE INDEX idx_messages_recipient_unread
  ON public.direct_messages(recipient_id, read, created_at DESC);

-- QUESTIONS TABLE
-- Open-ended questions submitted by members
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asked_by_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  context TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fetching active questions
CREATE INDEX idx_questions_active_created
  ON public.questions(is_active, created_at DESC);

-- QUESTION ANSWERS TABLE
-- User answers to questions
CREATE TABLE public.question_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Ensure one answer per user per question
  UNIQUE(question_id, user_id)
);

-- Index for efficient answer lookups
CREATE INDEX idx_answers_question_created
  ON public.question_answers(question_id, created_at DESC);

-- AI EXCHANGES TABLE
-- Store and share AI coaching conversations
CREATE TABLE public.ai_exchanges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB NOT NULL, -- Structured: [{role: "user"|"assistant", message: "..."}]
  source TEXT, -- e.g., "Claude", "ChatGPT", "Other"
  tags TEXT[],
  is_shared BOOLEAN DEFAULT TRUE NOT NULL,
  insights TEXT, -- User's key takeaways
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for AI exchanges
CREATE INDEX idx_ai_exchanges_user_created
  ON public.ai_exchanges(user_id, created_at DESC);
CREATE INDEX idx_ai_exchanges_shared_created
  ON public.ai_exchanges(is_shared, created_at DESC);

-- PERSONAL SUMMARIES TABLE
-- AI-generated summaries of user progress and patterns
CREATE TABLE public.personal_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  summary_content TEXT NOT NULL, -- AI-generated markdown/HTML
  summary_data JSONB, -- Structured data used for generation
  generation_prompt TEXT, -- The prompt used
  model_used TEXT, -- e.g., "claude-3-5-sonnet-20241022"
  tokens_used INTEGER,
  generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  version INTEGER DEFAULT 1 NOT NULL -- For tracking regenerations
);

-- Index for user summaries
CREATE INDEX idx_summaries_user_generated
  ON public.personal_summaries(user_id, generated_at DESC);

-- SCHEDULE EVENTS TABLE
-- Coordinate group meetings and availability
CREATE TABLE public.schedule_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  proposed_start TIMESTAMPTZ NOT NULL,
  proposed_end TIMESTAMPTZ,
  location TEXT,
  is_confirmed BOOLEAN DEFAULT FALSE NOT NULL,
  event_type TEXT, -- e.g., "meeting", "availability_check", "hangout"
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for upcoming events
CREATE INDEX idx_events_start_time
  ON public.schedule_events(proposed_start);

-- SCHEDULE RESPONSES TABLE
-- User responses to scheduled events
CREATE TABLE public.schedule_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.schedule_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  response TEXT NOT NULL CHECK (response IN ('available', 'unavailable', 'maybe')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- One response per user per event
  UNIQUE(event_id, user_id)
);

-- Index for event responses
CREATE INDEX idx_schedule_responses_event
  ON public.schedule_responses(event_id, response);

-- COMMITMENTS TABLE
-- User commitments/goals with accountability
CREATE TABLE public.commitments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task TEXT NOT NULL,
  outcome TEXT NOT NULL,
  deadline DATE NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'completed', 'missed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for user commitments, sorted by deadline
CREATE INDEX idx_commitments_user_deadline
  ON public.commitments(user_id, deadline ASC);
CREATE INDEX idx_commitments_status_deadline
  ON public.commitments(status, deadline ASC);

-- ACTIVITY LOG TABLE
-- Comprehensive audit trail for history and overview
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- e.g., "life_status_update", "question_answered", etc.
  entity_type TEXT NOT NULL, -- Table name
  entity_id UUID NOT NULL, -- Referenced record ID
  metadata JSONB, -- Additional context
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for activity queries
CREATE INDEX idx_activity_user_created
  ON public.activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_created
  ON public.activity_log(created_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_life_status_updated_at
  BEFORE UPDATE ON public.life_status_updates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_answers_updated_at
  BEFORE UPDATE ON public.question_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_exchanges_updated_at
  BEFORE UPDATE ON public.ai_exchanges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.schedule_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_responses_updated_at
  BEFORE UPDATE ON public.schedule_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commitments_updated_at
  BEFORE UPDATE ON public.commitments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
