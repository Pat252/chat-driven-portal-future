/**
 * Messages API Route
 * 
 * GET /api/conversations/[conversationId]/messages
 * Fetches all messages for a specific conversation
 * Enforces security via RLS (only returns messages the user owns)
 */

import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

interface RouteContext {
  params: {
    conversationId: string
  }
}

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { conversationId } = context.params

    // Validate conversationId
    if (!conversationId) {
      return new Response(
        JSON.stringify({ error: 'Conversation ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Get authenticated user
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user || authError) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Fetch messages for this conversation
    // RLS policies ensure we only get messages the user owns
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('id, role, content_enc, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('[Messages API] Failed to fetch messages:', messagesError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch messages' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Transform to frontend format
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content_enc,
    }))

    return new Response(
      JSON.stringify({ messages: formattedMessages }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error: any) {
    console.error('[Messages API] Error:', error)
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

