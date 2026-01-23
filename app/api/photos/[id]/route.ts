/**
 * Single Photo API Routes
 *
 * DELETE /api/photos/[id] - Delete a photo
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get photo info first
    const { data: photo, error: fetchError } = await supabase
      .from('photos')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns this photo
      .single();

    if (fetchError || !photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Extract filename from URL
    const urlParts = photo.photo_url.split('/');
    const fileName = `${user.id}/${urlParts[urlParts.length - 1]}`;

    // Delete from database
    const { error: dbError } = await supabase
      .from('photos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (dbError) {
      return NextResponse.json(
        { error: 'Failed to delete photo' },
        { status: 500 }
      );
    }

    // Delete from storage using admin client
    const adminClient = createAdminClient();
    await adminClient.storage.from('photos').remove([fileName]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Photo delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
