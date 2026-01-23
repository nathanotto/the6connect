/**
 * Photos API Routes
 *
 * POST /api/photos - Upload a new photo
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const photo = formData.get('photo') as File;
    const caption = formData.get('caption') as string;

    if (!photo) {
      return NextResponse.json(
        { error: 'No photo provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!photo.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    if (photo.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image must be less than 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = photo.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    // Use admin client for storage upload (bypasses RLS)
    const adminClient = createAdminClient();

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('photos')
      .upload(fileName, photo, {
        contentType: photo.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: `Failed to upload photo: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = adminClient.storage.from('photos').getPublicUrl(fileName);

    // Save metadata to database
    const { data: photoData, error: dbError } = await supabase
      .from('photos')
      .insert({
        user_id: user.id,
        photo_url: publicUrl,
        caption: caption || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Try to clean up uploaded file
      await supabase.storage.from('photos').remove([fileName]);
      return NextResponse.json(
        { error: 'Failed to save photo metadata' },
        { status: 500 }
      );
    }

    // Log activity
    // @ts-ignore
    await supabase.from('activity_log').insert({
      user_id: user.id,
      activity_type: 'photo_uploaded',
      entity_type: 'photos',
      entity_id: photoData.id,
      metadata: {
        caption: caption || null,
      },
    });

    return NextResponse.json({ data: photoData });
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
