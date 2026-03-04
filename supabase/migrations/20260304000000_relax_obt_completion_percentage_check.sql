-- Relax completion_percentage check on game_one_big_things
-- Original constraint only allowed 0 or 100; now allows any value 0–100
ALTER TABLE game_one_big_things
  DROP CONSTRAINT game_one_big_things_completion_percentage_check;

ALTER TABLE game_one_big_things
  ADD CONSTRAINT game_one_big_things_completion_percentage_check
  CHECK (completion_percentage >= 0 AND completion_percentage <= 100);
