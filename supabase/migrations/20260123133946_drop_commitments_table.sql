-- Drop commitments table and related objects

-- Drop policies first
DROP POLICY IF EXISTS "Users can view all commitments" ON commitments;
DROP POLICY IF EXISTS "Users can insert their own commitments" ON commitments;
DROP POLICY IF EXISTS "Users can update their own commitments" ON commitments;
DROP POLICY IF EXISTS "Users can delete their own commitments" ON commitments;

-- Drop indexes
DROP INDEX IF EXISTS commitments_user_id_idx;
DROP INDEX IF EXISTS commitments_deadline_idx;
DROP INDEX IF EXISTS commitments_status_idx;

-- Drop table
DROP TABLE IF EXISTS commitments;
