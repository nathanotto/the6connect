/**
 * Dashboard Layout
 *
 * Main layout for authenticated dashboard pages.
 * Includes navigation sidebar and header.
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} profile={profile} />
      <main className="flex-1 p-8 bg-background">
        {children}
      </main>
    </div>
  );
}
