import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const searchParams = request.nextUrl.searchParams;
  const checkinsLastViewed = searchParams.get('checkinsLastViewed');
  const photosLastViewed = searchParams.get('photosLastViewed');

  const [checkinsResult, photosResult] = await Promise.all([
    checkinsLastViewed
      ? supabase
          .from('life_status_updates')
          .select('*', { count: 'exact', head: true })
          .neq('user_id', user.id)
          .gt('created_at', checkinsLastViewed)
      : Promise.resolve({ count: 0 }),
    photosLastViewed
      ? supabase
          .from('photos')
          .select('*', { count: 'exact', head: true })
          .gt('created_at', photosLastViewed)
      : Promise.resolve({ count: 0 }),
  ]);

  return NextResponse.json({
    newCheckins: checkinsResult.count ?? 0,
    newPhotos: photosResult.count ?? 0,
  });
}
