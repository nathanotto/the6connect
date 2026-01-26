-- 90-Day Game Tables
-- Comprehensive system for tracking 90-day accountability games

-- Games table: Each 90-day game cycle
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('setup', 'active', 'completed')),
  created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Game participants: Who's in each game
CREATE TABLE game_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opted_in BOOLEAN DEFAULT false NOT NULL,
  game_name TEXT,
  game_image_url TEXT,
  setup_complete BOOLEAN DEFAULT false NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(game_id, user_id)
);

-- Vision statements
CREATE TABLE game_vision_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  completion_percentage INTEGER CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(game_id, user_id)
);

-- Why statements
CREATE TABLE game_why_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  completion_percentage INTEGER CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(game_id, user_id)
);

-- Objectives
CREATE TABLE game_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  completion_percentage INTEGER CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(game_id, user_id)
);

-- Key Results
CREATE TABLE game_key_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  weight_percentage INTEGER CHECK (weight_percentage >= 0 AND weight_percentage <= 100),
  completion_percentage INTEGER CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  notes TEXT,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Projects
CREATE TABLE game_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  weight_percentage INTEGER CHECK (weight_percentage >= 0 AND weight_percentage <= 100),
  completion_percentage INTEGER CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  notes TEXT,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Inner Game Items
CREATE TABLE game_inner_game_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('limiting', 'empowering')),
  category TEXT NOT NULL, -- 'belief', 'value', 'habit', 'motivator', 'strength', 'accountability'
  description TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- One Big Things (Bi-weekly)
CREATE TABLE game_one_big_things (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  completion_percentage INTEGER CHECK (completion_percentage IN (0, 100)) NOT NULL DEFAULT 0,
  notes TEXT,
  week_number INTEGER CHECK (week_number >= 1 AND week_number <= 6) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(game_id, user_id, week_number)
);

-- Indexes for performance
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_created_by ON games(created_by_user_id);
CREATE INDEX idx_game_participants_game ON game_participants(game_id);
CREATE INDEX idx_game_participants_user ON game_participants(user_id);
CREATE INDEX idx_game_vision_game_user ON game_vision_statements(game_id, user_id);
CREATE INDEX idx_game_why_game_user ON game_why_statements(game_id, user_id);
CREATE INDEX idx_game_objectives_game_user ON game_objectives(game_id, user_id);
CREATE INDEX idx_game_key_results_game_user ON game_key_results(game_id, user_id);
CREATE INDEX idx_game_projects_game_user ON game_projects(game_id, user_id);
CREATE INDEX idx_game_inner_game_game_user ON game_inner_game_items(game_id, user_id);
CREATE INDEX idx_game_obts_game_user ON game_one_big_things(game_id, user_id);

-- Row Level Security Policies

-- Games: Everyone can read, anyone can create
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read all games"
  ON games FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create games"
  ON games FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Game participants: Everyone can read, users can insert themselves
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read all game participants"
  ON game_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can insert themselves as participants"
  ON game_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation"
  ON game_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- Vision statements: Everyone can read, users can only modify their own
ALTER TABLE game_vision_statements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read all vision statements"
  ON game_vision_statements FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own vision statements"
  ON game_vision_statements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vision statements"
  ON game_vision_statements FOR UPDATE
  USING (auth.uid() = user_id);

-- Why statements: Same as vision
ALTER TABLE game_why_statements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read all why statements"
  ON game_why_statements FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own why statements"
  ON game_why_statements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own why statements"
  ON game_why_statements FOR UPDATE
  USING (auth.uid() = user_id);

-- Objectives: Same as vision
ALTER TABLE game_objectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read all objectives"
  ON game_objectives FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own objectives"
  ON game_objectives FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own objectives"
  ON game_objectives FOR UPDATE
  USING (auth.uid() = user_id);

-- Key Results: Same pattern
ALTER TABLE game_key_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read all key results"
  ON game_key_results FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own key results"
  ON game_key_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own key results"
  ON game_key_results FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own key results"
  ON game_key_results FOR DELETE
  USING (auth.uid() = user_id);

-- Projects: Same pattern
ALTER TABLE game_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read all projects"
  ON game_projects FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own projects"
  ON game_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON game_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON game_projects FOR DELETE
  USING (auth.uid() = user_id);

-- Inner Game Items: Same pattern
ALTER TABLE game_inner_game_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read all inner game items"
  ON game_inner_game_items FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own inner game items"
  ON game_inner_game_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inner game items"
  ON game_inner_game_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inner game items"
  ON game_inner_game_items FOR DELETE
  USING (auth.uid() = user_id);

-- One Big Things: Same pattern
ALTER TABLE game_one_big_things ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read all one big things"
  ON game_one_big_things FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own one big things"
  ON game_one_big_things FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own one big things"
  ON game_one_big_things FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own one big things"
  ON game_one_big_things FOR DELETE
  USING (auth.uid() = user_id);

-- Supabase Storage bucket for game images
INSERT INTO storage.buckets (id, name, public)
VALUES ('game-images', 'game-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view game images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'game-images');

CREATE POLICY "Authenticated users can upload game images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'game-images' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update their own game images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'game-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
