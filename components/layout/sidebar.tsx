'use client';

/**
 * Sidebar Navigation
 *
 * Main navigation for the dashboard.
 */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface SidebarProps {
  user: User;
  profile: {
    full_name: string;
    display_name?: string;
  } | null;
}

export function Sidebar({ user, profile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: 'Home' },
    { name: 'Messages', href: '/dashboard/messages', icon: 'MessageSquare' },
    { name: 'Life Status', href: '/dashboard/life-status', icon: 'Activity' },
    { name: 'Commitments', href: '/dashboard/commitments', icon: 'CheckSquare' },
    { name: 'Questions', href: '/dashboard/questions', icon: 'HelpCircle' },
    { name: 'AI Exchanges', href: '/dashboard/ai-exchanges', icon: 'Sparkles' },
    { name: 'Summaries', href: '/dashboard/summaries', icon: 'FileText' },
    { name: 'Schedule', href: '/dashboard/schedule', icon: 'Calendar' },
  ];

  return (
    <div className="w-64 bg-foreground text-background p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">the6connect</h1>
        <p className="text-sm opacity-60 mt-1">Men's Accountability</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navigation.map((item) => {
          // Special handling for Overview - only match exactly /dashboard
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`block px-4 py-2 rounded-lg transition ${
                isActive
                  ? 'bg-background text-foreground'
                  : 'hover:bg-background/10'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-background/20 pt-4 space-y-2">
        <Link
          href={`/dashboard/profile/${user.id}`}
          className="block px-4 py-2 rounded-lg hover:bg-background/10 transition"
        >
          {profile?.display_name || profile?.full_name || 'Profile'}
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full text-left px-4 py-2 rounded-lg hover:bg-background/10 transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
