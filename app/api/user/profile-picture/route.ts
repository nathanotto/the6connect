/**
 * Profile Picture API
 *
 * POST /api/user/profile-picture - Upload profile picture
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
    const picture = formData.get('profile_picture') as File;

    if (!picture) {
      return NextResponse.json(
        { error: 'No picture provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!picture.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    if (picture.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image must be less than 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = picture.name.split('.').pop();
    const fileName = `${user.id}/profile.${fileExt}`;

    // Use admin client for storage upload
    const adminClient = createAdminClient();

    // Delete old profile picture if exists
    const { data: oldProfile } = await supabase
      .from('users')
      .select('profile_picture_url')
      .eq('id', user.id)
      .single();

    if (oldProfile?.profile_picture_url) {
      const oldFileName = `${user.id}/profile.${oldProfile.profile_picture_url.split('.').pop()}`;
      await adminClient.storage.from('photos').remove([oldFileName]);
    }

    // Upload new picture
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('photos')
      .upload(fileName, picture, {
        contentType: picture.type,
        cacheControl: '3600',
        upsert: true, // Replace if exists
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: `Failed to upload picture: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = adminClient.storage.from('photos').getPublicUrl(fileName);

    // Update user profile with new picture URL
    // @ts-ignore
    const { error: dbError } = await supabase
      .from('users')
      .update({ profile_picture_url: publicUrl })
      .eq('id', user.id);

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
