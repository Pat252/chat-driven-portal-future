/**
 * Server Actions for Authentication
 * 
 * These actions run on the server and handle OAuth flows properly.
 * They work with Next.js App Router and Supabase PKCE flow.
 */

'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'

/**
 * Initiate Google OAuth login flow
 * 
 * This server action:
 * 1. Detects the current origin (localhost or production)
 * 2. Creates a Supabase server client
 * 3. Initiates OAuth with Google
 * 4. Redirects user to Google consent screen
 * 
 * Works with:
 * - localhost:3000
 * - chat.aidrivenfuture.ca
 * - Cloudflare Tunnel (uses x-forwarded-host and x-forwarded-proto)
 */
export async function signInWithGoogleAction() {
  const headersList = headers()
  
  // Detect origin from headers (works with Cloudflare Tunnel)
  const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost:3000'
  const protocol = headersList.get('x-forwarded-proto') || 'http'
  const origin = `${protocol}://${host}`
  
  console.log('[Server Action] OAuth initiated')
  console.log('[Server Action] Origin:', origin)
  console.log('[Server Action] Callback URL:', `${origin}/auth/callback`)
  
  // Create Supabase server client
  const supabase = createServerClient()
  
  // Initiate OAuth with Google
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
      // PKCE flow is enabled by default in @supabase/ssr
    },
  })
  
  if (error) {
    console.error('[Server Action] OAuth error:', error.message)
    redirect('/auth/auth-code-error')
  }
  
  if (data?.url) {
    console.log('[Server Action] Redirecting to Google login')
    // Redirect to Google's OAuth consent screen
    redirect(data.url)
  }
  
  // Fallback: if no URL returned, something went wrong
  redirect('/auth/auth-code-error')
}

/**
 * Sign out the current user
 */
export async function signOutAction() {
  const supabase = createServerClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('[Server Action] Sign out error:', error.message)
  }
  
  redirect('/')
}

