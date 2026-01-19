/**
 * Chat API Route - Ollama Streaming
 * 
 * Handles streaming chat requests to local Ollama instance.
 * Streams responses token-by-token back to the client.
 */

import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

const OLLAMA_BASE_URL = 'http://localhost:11434'
const DEFAULT_MODEL = 'llama3.1:8b'

/**
 * Generate a concise conversation title from the first user message
 * Returns a 5-7 word summary
 */
function generateConversationTitle(firstMessage: string): string {
  // Remove common question words and clean up
  const cleaned = firstMessage
    .trim()
    .replace(/^(what|how|why|when|where|who|is|are|can|could|would|should|explain|tell|describe|help|show)\s+/i, '')
    .replace(/\?+$/, '')
    .trim()

  // Split into words and take first 7 words max
  const words = cleaned.split(/\s+/).filter(w => w.length > 0)
  const titleWords = words.slice(0, 7)

  if (titleWords.length === 0) {
    return 'New Conversation'
  }

  // Capitalize first letter of first word, rest lowercase
  const title = titleWords
    .map((word, idx) => {
      if (idx === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      }
      return word.toLowerCase()
    })
    .join(' ')

  return title
}

/**
 * POST /api/chat
 * 
 * Accepts:
 * {
 *   "message": "string",
 *   "model": "string (optional)" // defaults to llama3.1:8b
 * }
 * 
 * Returns: Streaming text/plain response
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json()
    const { message, model = DEFAULT_MODEL, conversationId } = body

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

    // Handle conversation ID
    let finalConversationId: string | null = conversationId || null
    let conversationHasTitle = false

    // If no conversationId provided, create a new conversation
    if (!finalConversationId) {
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: null,
        })
        .select('id')
        .single()

      if (convError || !newConversation) {
        console.error('[Chat API] Failed to create conversation:', convError)
        return new Response(
          JSON.stringify({ error: 'Failed to create conversation' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      finalConversationId = newConversation.id
      conversationHasTitle = false
    } else {
      // Check if conversation already has a title
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('title')
        .eq('id', finalConversationId)
        .single()
      
      conversationHasTitle = Boolean(existingConversation?.title)
    }

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Message is required and must be a non-empty string' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate model
    if (typeof model !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Model must be a string' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Insert user message into messages table
    const trimmedMessage = message.trim()
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: finalConversationId,
        user_id: user.id,
        role: 'user',
        content_enc: trimmedMessage,
      })

    if (messageError) {
      console.error('[Chat API] Failed to insert user message:', messageError)
      return new Response(
        JSON.stringify({ error: 'Failed to save message' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Fetch conversation history if conversationId exists
    let conversationHistory: Array<{ role: string; content: string }> = []
    
    if (finalConversationId) {
      const { data: messages, error: historyError } = await supabase
        .from('messages')
        .select('role, content_enc, created_at')
        .eq('conversation_id', finalConversationId)
        .order('created_at', { ascending: true })

      if (!historyError && messages) {
        // Exclude the message we just inserted (it will be added separately)
        conversationHistory = messages
          .filter(msg => msg.content_enc !== trimmedMessage)
          .map(msg => ({
            role: msg.role,
            content: msg.content_enc,
          }))
      }
    }

    // Get model-specific system prompt
    const getSystemPrompt = (modelName: string): string => {
      if (modelName === 'deepseek-r1:7b') {
        return (
          'You are a reasoning-focused assistant.\n' +
          'Explain concepts clearly and accurately.\n' +
          'Use proper paragraphs and bullet points when helpful.\n' +
          'Do NOT repeat words or phrases.\n' +
          'Do NOT expose chain-of-thought or internal reasoning.\n' +
          'Present conclusions cleanly and concisely.'
        )
      } else if (modelName === 'llama3.1:8b') {
        return (
          'You are a fast, concise assistant.\n' +
          'Answer clearly and directly.\n' +
          'Keep responses short unless more detail is requested.\n' +
          'Avoid repetition.\n' +
          'Use bullet points only when helpful.'
        )
      }
      // Fallback
      return 'You are a helpful assistant. Be concise and clear.'
    }

    // Build messages array: system prompt + conversation history + new user message
    const messagesToSend = [
      {
        role: 'system',
        content: getSystemPrompt(model),
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message.trim(),
      },
    ]

    // Prepare Ollama request
    const ollamaUrl = `${OLLAMA_BASE_URL}/api/chat`
    const ollamaPayload = {
      model,
      stream: true,
      messages: messagesToSend,
      options: {
        temperature: 0.4,
        top_p: 0.9,
        repeat_penalty: 1.2,
        presence_penalty: 0.6,
      },
    }

    // Create AbortController for client abort handling
    const controller = new AbortController()
    const abortSignal = controller.signal

    // Forward client abort signal
    req.signal.addEventListener('abort', () => {
      controller.abort()
    })

    // Fetch from Ollama with streaming
    const ollamaResponse = await fetch(ollamaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ollamaPayload),
      signal: abortSignal,
    })

    // Handle Ollama errors
    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text()
      console.error('[Chat API] Ollama error:', ollamaResponse.status, errorText)
      
      return new Response(
        JSON.stringify({
          error: 'Failed to connect to Ollama',
          details: errorText,
        }),
        {
          status: ollamaResponse.status || 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Accumulate assistant response text
    let assistantText = ''

    // Create a ReadableStream to transform Ollama's JSON stream to text
    const stream = new ReadableStream({
      async start(controller) {
        const reader = ollamaResponse.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          controller.close()
          return
        }

        try {
          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              controller.close()
              break
            }

            // Decode chunk
            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n').filter((line) => line.trim())

            // Parse each JSON line from Ollama
            for (const line of lines) {
              try {
                const data = JSON.parse(line)

                // Ollama streaming format: { message: { content: "..." }, done: false }
                if (data.message?.content) {
                  // Accumulate assistant text
                  assistantText += data.message.content
                  
                  // Stream the message content text
                  const encoder = new TextEncoder()
                  controller.enqueue(encoder.encode(data.message.content))
                }

                // If done, close the stream
                if (data.done) {
                  controller.close()
                  return
                }
              } catch (parseError) {
                // Skip invalid JSON lines (might be partial chunks)
                console.warn('[Chat API] Failed to parse JSON line:', line)
              }
            }
          }
        } catch (error: any) {
          // Handle abort or other errors
          if (error.name === 'AbortError') {
            console.log('[Chat API] Request aborted by client')
            controller.close()
          } else {
            console.error('[Chat API] Stream error:', error)
            controller.error(error)
          }
        } finally {
          reader.releaseLock()
          
          // Persist assistant message after streaming completes
          if (assistantText.trim()) {
            ;(async () => {
              try {
                const { error: messageError } = await supabase
                  .from('messages')
                  .insert({
                    conversation_id: finalConversationId,
                    user_id: user.id,
                    role: 'assistant',
                    content_enc: assistantText,
                  })
                
                if (messageError) {
                  console.error('[Chat API] Failed to insert assistant message:', messageError)
                } else {
                  // Generate and update conversation title if it doesn't have one
                  if (!conversationHasTitle && finalConversationId) {
                    const title = generateConversationTitle(trimmedMessage)
                    await supabase
                      .from('conversations')
                      .update({ title })
                      .eq('id', finalConversationId)
                  }
                }
              } catch (err) {
                console.error('[Chat API] Error inserting assistant message:', err)
              }
            })()
          }
        }
      },
    })

    // Return streaming response with conversationId in header
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
        'X-Conversation-Id': finalConversationId || '',
      },
    })
  } catch (error: any) {
    // Handle request parsing errors
    if (error.name === 'AbortError') {
      console.log('[Chat API] Request aborted')
      return new Response('Request aborted', { status: 499 })
    }

    console.error('[Chat API] Error:', error)
    
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

