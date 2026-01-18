import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const origin = requestUrl.origin

  if (error) {
    console.error('OAuth error:', error, errorDescription)
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  if (code) {
    // Create redirect response - cookies will be added to this response
    const redirectUrl = `${origin}/chat`
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
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError.message)
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }

    // Return the redirect response with cookies already set
    return response
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

