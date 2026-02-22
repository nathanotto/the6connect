/**
 * The Six Pics Page
 *
 * Photo sharing with captions for the group
 */

import { createClient } from '@/lib/supabase/server';
import { PhotoUploadForm } from '@/components/photos/photo-upload-form';
import { PhotoList } from '@/components/photos/photo-list';
import { PageViewTracker } from '@/components/dashboard/page-view-tracker';

export default async function PhotosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch all photos with user info, most recent first
  const { data: photos } = await supabase
    .from('photos')
    .select(`
      *,
      user:users!photos_user_id_fkey(id, full_name, display_name)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <PageViewTracker storageKey="photos_last_viewed" />
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">The Six Pics</h1>
        <p className="text-foreground/60 mt-2">
          Share photos with the group
        </p>
      </div>

      {/* Upload Section */}
      <div className="border border-foreground/20 rounded-lg p-6 bg-foreground/5">
        <h2 className="text-xl font-semibold mb-4">Upload a Photo</h2>
        <PhotoUploadForm currentUserId={user.id} />
      </div>

      {/* Photos Feed */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Photos</h2>
        <PhotoList photos={photos || []} currentUserId={user.id} />
      </div>
    </div>
  );
}
