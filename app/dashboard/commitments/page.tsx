/**
 * Commitments Page
 *
 * Create and track personal commitments
 */

import { createClient } from '@/lib/supabase/server';
import { CommitmentForm } from '@/components/commitments/commitment-form';
import { CommitmentList } from '@/components/commitments/commitment-list';

export default async function CommitmentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch user's commitments for stats
  const { data: userCommitments } = await supabase
    .from('commitments')
    .select('*')
    .eq('user_id', user.id)
    .order('deadline', { ascending: true });

  // Separate user commitments by status for stats
  const userPending = userCommitments?.filter((c) => c.status === 'pending') || [];
  const userCompleted = userCommitments?.filter((c) => c.status === 'completed') || [];
  const userMissed = userCommitments?.filter((c) => c.status === 'missed') || [];

  // Fetch all users' commitments
  const { data: allCommitments } = await supabase
    .from('commitments')
    .select(`
      *,
      user:users(id, full_name, display_name)
    `)
    .order('deadline', { ascending: true });

  // Separate all commitments by status
  const allPending = allCommitments?.filter((c) => c.status === 'pending') || [];
  const allCompleted = allCommitments?.filter((c) => c.status === 'completed') || [];
  const allMissed = allCommitments?.filter((c) => c.status === 'missed') || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Commitments</h1>
        <p className="text-foreground/60 mt-2">
          Set and track your personal commitments for accountability
        </p>
      </div>

      {/* Stats - Your Commitments Only */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-foreground/20 rounded-lg p-4">
          <h3 className="text-sm font-medium text-foreground/60">Your Active</h3>
          <p className="text-3xl font-bold mt-1">{userPending.length}</p>
        </div>
        <div className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
            Your Completed
          </h3>
          <p className="text-3xl font-bold mt-1 text-green-800 dark:text-green-200">
            {userCompleted.length}
          </p>
        </div>
        <div className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            Your Missed
          </h3>
          <p className="text-3xl font-bold mt-1 text-red-800 dark:text-red-200">
            {userMissed.length}
          </p>
        </div>
      </div>

      {/* Active Commitments and Create New - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Commitments - All Users */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Active Commitments - All Members</h2>
          {allPending.length > 0 ? (
            <CommitmentList commitments={allPending} showActions={true} currentUserId={user.id} />
          ) : (
            <div className="border border-foreground/20 rounded-lg p-6 text-center">
              <p className="text-foreground/60 text-sm">
                No active commitments yet.
              </p>
            </div>
          )}
        </div>

        {/* Create New Commitment */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Create New Commitment</h2>
          <div className="border border-foreground/20 rounded-lg p-4">
            <CommitmentForm />
          </div>
        </div>
      </div>

      {/* Completed Commitments - All Users */}
      {allCompleted.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Completed Commitments - All Members</h2>
          <CommitmentList commitments={allCompleted} showActions={false} />
        </div>
      )}

      {/* Missed Commitments - All Users */}
      {allMissed.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Missed Commitments - All Members</h2>
          <CommitmentList commitments={allMissed} showActions={false} />
        </div>
      )}

      {allCommitments && allCommitments.length === 0 && (
        <div className="border border-foreground/20 rounded-lg p-8 text-center">
          <p className="text-foreground/60">
            No commitments yet. Create your first commitment above to get started!
          </p>
        </div>
      )}
    </div>
  );
}
