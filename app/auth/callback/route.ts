/**
 * OAuth Callback Route
 * 
 * This route handles the OAuth callback from providers like Google, GitHub, etc.
 * After the user authorizes, the provider redirects to this route with a code.
 * We exchange the code for a session and redirect to the home page.
 */

import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient()
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to home page or dashboard after successful authentication
  return NextResponse.redirect(`${origin}/`)
}

