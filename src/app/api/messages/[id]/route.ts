import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Message } from '@/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data as Message[]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const body = await request.json();

    const messagesToInsert = Array.isArray(body) ? body : [body];

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('messages')
      .insert(
        messagesToInsert.map((m: { role: string; content: string }) => ({
          conversation_id: conversationId,
          role: m.role,
          content: m.content,
        }))
      )
      .select();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return Response.json(data as Message[]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const { searchParams } = new URL(request.url);
    const afterId = searchParams.get('after');

    const supabase = await createServerSupabaseClient();

    if (afterId) {
      // Delete messages after a certain message (for edit/fork)
      const { data: refMessage } = await supabase
        .from('messages')
        .select('created_at')
        .eq('id', afterId)
        .single();

      if (refMessage) {
        const { error } = await supabase
          .from('messages')
          .delete()
          .eq('conversation_id', conversationId)
          .gt('created_at', refMessage.created_at);

        if (error) {
          return Response.json({ error: error.message }, { status: 500 });
        }
      }
    } else {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
    }

    return Response.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
