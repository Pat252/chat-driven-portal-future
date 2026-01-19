import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // PART 1: Log all headers for Cloudflared diagnosis
  console.log('========== CALLBACK DIAGNOSTICS ==========')
  console.log('[Callback] request.url:', request.url)
  console.log('[Callback] host:', request.headers.get('host'))
  console.log('[Callback] x-forwarded-host:', request.headers.get('x-forwarded-host'))
  console.log('[Callback] x-forwarded-proto:', request.headers.get('x-forwarded-proto'))
  console.log('[Callback] x-forwarded-for:', request.headers.get('x-forwarded-for'))
  
  // PART 2: Reconstruct origin from forwarded headers (Cloudflared support)
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto')
  const host = forwardedHost ?? request.headers.get('host') ?? 'localhost:3000'
  const proto = forwardedProto ?? (host.includes('localhost') ? 'http' : 'https')
  const reconstructedOrigin = `${proto}://${host}`
  
  console.log('[Callback] Reconstructed origin:', reconstructedOrigin)
  
  // Parse URL - handle both direct access and proxied access
  let requestUrl: URL
  try {
    // If accessed via Cloudflared, request.url might have localhost in it
    // Replace with the forwarded host
    if (forwardedHost && request.url.includes('localhost')) {
      const correctedUrl = request.url.replace(/http:\/\/localhost:\d+/, reconstructedOrigin)
      console.log('[Callback] Corrected URL:', correctedUrl)
      requestUrl = new URL(correctedUrl)
    } else {
      requestUrl = new URL(request.url)
    }
  } catch (e) {
    console.error('[Callback] Failed to parse URL:', e)
    requestUrl = new URL(request.url)
  }
  
  // Debug logging
  console.log('[Callback] Parsed URL:', requestUrl.toString())
  console.log('[Callback] Search params:', requestUrl.searchParams.toString())
  console.log('[Callback] Hash:', requestUrl.hash)
  
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const next = requestUrl.searchParams.get('next') ?? '/chat'
  
  // Use NEXT_PUBLIC_SITE_URL to ensure redirect stays on public domain
  // Remove any trailing slashes
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? reconstructedOrigin).replace(/\/$/, '')

  console.log('[Callback] Site URL:', siteUrl)
  console.log('[Callback] Code:', code)
  console.log('[Callback] Error:', error)
  console.log('===========================================')

  // Handle OAuth errors
  if (error) {
    console.error('[Callback] OAuth error:', error, errorDescription)
    return NextResponse.redirect(`${siteUrl}/auth/auth-code-error`)
  }

  // Handle authorization code flow
  if (code) {
    console.log('[Callback] Processing authorization code...')
    
    // Create redirect response - cookies will be added to this response
    const redirectUrl = `${siteUrl}${next}`
    let response = NextResponse.redirect(redirectUrl)

    // Create Supabase client for Route Handler that writes cookies to response
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // Ensure path=/ so cookie is available site-wide
            const cookieOptions = {
              ...options,
              path: '/',
            }
            // Update request cookies
            request.cookies.set({
              name,
              value,
              ...cookieOptions,
            })
            // Set cookies on the redirect response
            response.cookies.set({
              name,
              value,
              ...cookieOptions,
            })
          },
          remove(name: string, options: any) {
            const cookieOptions = {
              ...options,
              path: '/',
            }
            request.cookies.set({
              name,
              value: '',
              ...cookieOptions,
            })
            response.cookies.set({
              name,
              value: '',
              ...cookieOptions,
            })
          },
        },
      }
    )
    
    // Exchange code for session - this will set cookies via the handlers above
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log('[Callback] Exchange error:', exchangeError?.message)
    console.log('[Callback] Session exists:', !!data?.session)
    console.log('[Callback] User:', data?.session?.user?.email)
    
    if (exchangeError) {
      console.error('[Callback] Error exchanging code for session:', exchangeError.message)
      return NextResponse.redirect(`${siteUrl}/auth/auth-code-error`)
    }

    if (!data?.session) {
      console.error('[Callback] No session returned after exchange')
      return NextResponse.redirect(`${siteUrl}/auth/auth-code-error`)
    }

    console.log('[Callback] Session exchanged successfully, redirecting to:', redirectUrl)
    
    // Return the redirect response with cookies already set
    return response
  }

  // Check for fragment-based tokens (implicit flow - shouldn't happen with PKCE)
  const hash = requestUrl.hash
  if (hash && hash.includes('access_token')) {
    console.log('[Callback] Detected fragment-based tokens (implicit flow)')
    console.warn('[Callback] WARNING: Implicit flow detected. This should not happen with PKCE.')
    
    // Extract tokens from hash
    const params = new URLSearchParams(hash.substring(1))
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    
    console.log('[Callback] Access token present:', !!accessToken)
    console.log('[Callback] Refresh token present:', !!refreshToken)
    
    if (accessToken) {
      const redirectUrl = `${siteUrl}${next}`
      let response = NextResponse.redirect(redirectUrl)

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value
            },
            set(name: string, value: string, options: any) {
              const cookieOptions = { ...options, path: '/' }
              request.cookies.set({ name, value, ...cookieOptions })
              response.cookies.set({ name, value, ...cookieOptions })
            },
            remove(name: string, options: any) {
              const cookieOptions = { ...options, path: '/' }
              request.cookies.set({ name, value: '', ...cookieOptions })
              response.cookies.set({ name, value: '', ...cookieOptions })
            },
          },
        }
      )

      // Set session from tokens
      const { data, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      })

      console.log('[Callback] Set session error:', sessionError?.message)
      console.log('[Callback] Session set:', !!data?.session)

      if (sessionError || !data?.session) {
        console.error('[Callback] Failed to set session from tokens')
        return NextResponse.redirect(`${siteUrl}/auth/auth-code-error`)
      }

      console.log('[Callback] Session set successfully from tokens')
      return response
    }
  }

  console.error('[Callback] No code or tokens found in request')
  return NextResponse.redirect(`${siteUrl}/auth/auth-code-error`)
}

