/**
 * Message Delete API Route
 * 
 * DELETE /api/messages/[messageId]
 * Deletes a message by ID
 * Enforces security via RLS (only deletes messages the user owns)
 */

import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

interface RouteContext {
  params: {
    messageId: string
  }
}

export async function DELETE(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { messageId } = context.params

    // Validate messageId
    if (!messageId) {
      return new Response(
        JSON.stringify({ error: 'Message ID is required' }),
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

    // Delete the message
    // RLS policies ensure we can only delete messages the user owns
    const { error: deleteError } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('[Messages API] Failed to delete message:', deleteError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete message' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
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

