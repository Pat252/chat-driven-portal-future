/**
 * Conversations API Route
 * 
 * GET /api/conversations
 * Lists all conversations for the authenticated user
 * Enforces security via RLS
 */

import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
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

    // Fetch conversations for this user
    // RLS policies ensure we only get conversations the user owns
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('id, title, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (conversationsError) {
      console.error('[Conversations API] Failed to fetch conversations:', conversationsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch conversations' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({ conversations: conversations || [] }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error: any) {
    console.error('[Conversations API] Error:', error)
    
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

