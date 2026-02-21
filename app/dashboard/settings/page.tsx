/**
 * Settings Page
 *
 * User account settings: profile picture, password, email, preferences
 */

import { createClient } from '@/lib/supabase/server';
import { ProfilePictureUpload } from '@/components/settings/profile-picture-upload';
import { PasswordResetForm } from '@/components/settings/password-reset-form';
import { EmailUpdateForm } from '@/components/settings/email-update-form';
import { WeeklyDigestToggle } from '@/components/settings/weekly-digest-toggle';

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-foreground/60 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Picture */}
      <div className="border border-foreground/20 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
        <ProfilePictureUpload
          currentPictureUrl={profile?.profile_picture_url || null}
          userId={user.id}
        />
      </div>

      {/* Email */}
      <div className="border border-foreground/20 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Email Address</h2>
        <EmailUpdateForm currentEmail={user.email || ''} />
      </div>

      {/* Password */}
      <div className="border border-foreground/20 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Password</h2>
        <PasswordResetForm userEmail={user.email || ''} />
      </div>

      {/* Preferences */}
      <div className="border border-foreground/20 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Preferences</h2>
        <WeeklyDigestToggle
          enabled={profile?.weekly_digest_enabled ?? true}
          userId={user.id}
        />
      </div>
    </div>
  );
}
