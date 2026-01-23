/**
 * Schedule Event Responses API Route
 *
 * POST /api/schedule/[id]/responses - Submit or update response to event
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { response, notes } = body;

    if (!response || !['available', 'unavailable', 'maybe'].includes(response)) {
      return NextResponse.json(
        { error: 'Valid response is required (available, unavailable, or maybe)' },
        { status: 400 }
      );
    }

    // Check if user already responded
    const { data: existingResponse } = await supabase
      .from('schedule_responses')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single();

    if (existingResponse) {
      // Update existing response
      const { data: updatedResponse, error } = await supabase
        .from('schedule_responses')
        .update({
          response,
          notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingResponse.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ response: updatedResponse });
    } else {
      // Create new response
      const { data: newResponse, error } = await supabase
        .from('schedule_responses')
        .insert({
          event_id: eventId,
          user_id: user.id,
          response,
          notes,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Log activity
      await supabase.from('activity_log').insert({
        user_id: user.id,
        activity_type: 'create',
        entity_type: 'schedule_response',
        entity_id: newResponse.id,
        metadata: { event_id: eventId, response },
      });

      return NextResponse.json({ response: newResponse }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
