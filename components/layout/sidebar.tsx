'use client';

/**
 * Sidebar Navigation
 *
 * Main navigation for the dashboard.
 * Responsive: Hamburger menu on mobile, persistent sidebar on desktop.
 */

import { useState } from 'react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: 'Home' },
    { name: 'Messages', href: '/dashboard/messages', icon: 'MessageSquare' },
    { name: 'Life Status', href: '/dashboard/life-status', icon: 'Activity' },
    { name: 'Questions', href: '/dashboard/questions', icon: 'HelpCircle' },
    { name: 'The Six Pics', href: '/dashboard/photos', icon: 'Image' },
    { name: 'Schedule', href: '/dashboard/schedule', icon: 'Calendar' },
    { name: '90-Day Game', href: '/dashboard/90-day-game', icon: 'Target' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-foreground text-background"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:relative
          inset-y-0 left-0
          w-64 bg-foreground text-background p-6 flex flex-col
          z-40
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
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
                onClick={closeMobileMenu}
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
            onClick={closeMobileMenu}
            className="block px-4 py-2 rounded-lg hover:bg-background/10 transition"
          >
            {profile?.display_name || profile?.full_name || 'Profile'}
          </Link>
          <Link
            href="/dashboard/settings"
            onClick={closeMobileMenu}
            className="block px-4 py-2 rounded-lg hover:bg-background/10 transition"
          >
            ⚙️ Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-background/10 transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
