/**
 * Question Answers API Routes
 *
 * GET /api/questions/[id]/answers - Get all answers for a question
 * POST /api/questions/[id]/answers - Submit an answer to a question
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
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

    // Fetch all answers for this question
    const { data, error } = await supabase
      .from('question_answers')
      .select(`
        *,
        user:users(id, full_name, display_name)
      `)
      .eq('question_id', id)
      .order('created_at', { ascending: true });

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

export async function POST(
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
    const body = await request.json();
    const { answer_text } = body;

    // Validate required fields
    if (!answer_text) {
      return NextResponse.json(
        { error: 'answer_text is required' },
        { status: 400 }
      );
    }

    // Submit answer (multiple answers allowed)
    const { data, error } = await supabase
      .from('question_answers')
      .insert({
        question_id: id,
        user_id: user.id,
        answer_text,
      })
      .select(`
        *,
        user:users(id, full_name, display_name)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.id,
      activity_type: 'question_answered',
      entity_type: 'question_answers',
      entity_id: data.id,
      metadata: {
        question_id: id,
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
