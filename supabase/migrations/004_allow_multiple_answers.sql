/**
 * Allow Multiple Answers Per Question
 *
 * Remove the UNIQUE constraint on question_answers to allow users
 * to submit multiple responses to the same question.
 */

-- Drop the unique constraint
ALTER TABLE public.question_answers
  DROP CONSTRAINT IF EXISTS question_answers_question_id_user_id_key;
