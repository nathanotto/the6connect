/**
 * Questions API Routes
 *
 * GET /api/questions - Get recent questions (5 most recent by default)
 * POST /api/questions - Create new question
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '5');

    // Fetch recent questions with asker info
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        asked_by:users!questions_asked_by_user_id_fkey(id, full_name, display_name)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { question_text, context } = body;

    // Validate required fields
    if (!question_text) {
      return NextResponse.json(
        { error: 'question_text is required' },
        { status: 400 }
      );
    }

    // Create new question
    const { data, error } = await supabase
      .from('questions')
      .insert({
        asked_by_user_id: user.id,
        question_text,
        context,
        is_active: true,
      })
      .select(`
        *,
        asked_by:users!questions_asked_by_user_id_fkey(id, full_name, display_name)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.id,
      activity_type: 'question_asked',
      entity_type: 'questions',
      entity_id: data.id,
      metadata: {
        question_text: question_text.substring(0, 100),
      },
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
