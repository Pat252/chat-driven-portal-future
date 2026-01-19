/**
 * OAuth Callback Route Handler
 * 
 * This route handles the OAuth callback from Supabase after Google authentication.
 * It exchanges the authorization code for a session and sets cookies.
 * 
 * Flow:
 * 1. Google redirects to Supabase: auth/v1/callback
 * 2. Supabase redirects to our app: /auth/callback?code=XXXXX
 * 3. This route exchanges code for session
 * 4. Sets HTTP-only cookies
 * 5. Redirects to /chat
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  
  // Extract code and error from query params
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  
  // Get origin for redirects (works with Cloudflare Tunnel)
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto')
  
  const origin = forwardedHost && forwardedProto
    ? `${forwardedProto}://${forwardedHost}`
    : requestUrl.origin
  
  console.log('[Callback] Request received')
  console.log('[Callback] Origin:', origin)
  console.log('[Callback] Code:', code ? '<present>' : 'null')
  console.log('[Callback] Error:', error || 'null')
  
  // Handle OAuth errors
  if (error) {
    console.error('[Callback] OAuth error:', error, errorDescription)
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${error}`)
  }
  
  // Validate code exists
  if (!code) {
    console.error('[Callback] No code parameter received')
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`)
  }
  
  try {
    // Create Supabase server client
    const supabase = createServerClient()
    
    // Exchange code for session
    console.log('[Callback] Exchanging code for session...')
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('[Callback] Exchange error:', exchangeError.message)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=exchange_failed`)
    }
    
    if (!data.session) {
      console.error('[Callback] No session returned after exchange')
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_session`)
    }
    
    console.log('[Callback] Session established for user:', data.user?.email)
    
    // Redirect to chat page
    // Cookies are automatically set by createServerClient
    return NextResponse.redirect(`${origin}/chat`)
    
  } catch (err: any) {
    console.error('[Callback] Unexpected error:', err.message)
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=unexpected`)
  }
}
