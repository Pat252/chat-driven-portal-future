/**
 * Supabase Server Client - Server-Side
 * 
 * This client is used for server-side operations in:
 * - Server Components
 * - Server Actions
 * - API Routes
 * 
 * It properly handles cookies for authentication state.
 * 
 * Usage in Server Component:
 * import { createServerClient } from '@/lib/supabase/server'
 * const supabase = createServerClient()
 * const { data, error } = await supabase.from('table').select()
 */

import { createServerClient as createClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createServerClient = () => {
  const cookieStore = cookies()

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Get the current authenticated user (server-side)
 */
export const getUser = async () => {
  const supabase = createServerClient()
  
  // Debug: Log available cookies (server-side only)
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()
  const supabaseCookies = allCookies.filter(cookie => 
    cookie.name.includes('supabase') || cookie.name.includes('sb-') || cookie.name.includes('auth-token')
  )
  
  if (supabaseCookies.length > 0) {
    console.log('[Server] Supabase cookies found:', supabaseCookies.map(c => `${c.name}=${c.value.substring(0, 20)}...`))
  } else {
    console.log('[Server] No Supabase cookies found. Available cookies:', allCookies.map(c => c.name))
  }
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error fetching user:', error.message)
    return null
  }
  
  if (user) {
    console.log('[Server] User authenticated:', user.email)
  } else {
    console.log('[Server] No authenticated user')
  }
  
  return user
}

/**
 * Get the current session (server-side)
 */
export const getSession = async () => {
  const supabase = createServerClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Error fetching session:', error.message)
    return null
  }
  
  return session
}

