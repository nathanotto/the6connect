-- the6connect Seed Data
-- Populate initial data for life areas

-- Insert the 4 life areas
INSERT INTO public.life_areas (id, name, description, icon, sort_order) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Personal Growth',
    'Self-improvement, learning, habits, health, and personal development',
    'TrendingUp',
    1
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Finances',
    'Financial health, budgeting, investments, and money management',
    'DollarSign',
    2
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Business',
    'Professional work, career, business ventures, and entrepreneurship',
    'Briefcase',
    3
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'Goals',
    'Current objectives, targets, and aspirations across all life areas',
    'Target',
    4
  );

-- Note: User accounts should be created manually through Supabase dashboard
-- or using the Supabase CLI after project setup.
-- This ensures proper authentication setup and password management.

-- Example command to create users (run after Supabase project is initialized):
-- supabase auth create-user --email user1@example.com --password SecurePassword123!
