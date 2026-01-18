/**
 * Supabase Connection Verification
 * 
 * This utility helps verify that Supabase is properly configured
 * and can connect to your project.
 * 
 * Usage:
 * import { verifySupabaseConnection } from '@/lib/supabase/verify'
 * const isConnected = await verifySupabaseConnection()
 */

import { supabase } from './client'

/**
 * Verify Supabase connection
 * Returns true if connection is successful, false otherwise
 */
export const verifySupabaseConnection = async (): Promise<boolean> => {
  try {
    // Try to get auth status - this doesn't require any tables
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Supabase connection error:', error.message)
      return false
    }

    console.log('✅ Supabase connection successful')
    return true
  } catch (error) {
    console.error('❌ Supabase connection failed:', error)
    return false
  }
}

/**
 * Get Supabase connection status with details
 */
export const getConnectionStatus = async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  if (!url || !hasKey) {
    return {
      connected: false,
      error: 'Missing environment variables',
      details: {
        hasUrl: Boolean(url),
        hasKey,
      },
    }
  }

  try {
    const { error } = await supabase.auth.getSession()
    
    if (error) {
      return {
        connected: false,
        error: error.message,
        details: {
          hasUrl: true,
          hasKey: true,
        },
      }
    }

    return {
      connected: true,
      error: null,
      details: {
        hasUrl: true,
        hasKey: true,
        projectUrl: url,
      },
    }
  } catch (error: any) {
    return {
      connected: false,
      error: error.message || 'Unknown error',
      details: {
        hasUrl: true,
        hasKey: true,
      },
    }
  }
}

/**
 * Test authentication flow
 */
export const testAuthFlow = async () => {
  try {
    // Check if user is already authenticated
    const { data: { user }, error } = await supabase.auth.getUser()
    
    return {
      success: true,
      authenticated: Boolean(user),
      user: user ? {
        id: user.id,
        email: user.email,
      } : null,
      error: error?.message || null,
    }
  } catch (error: any) {
    return {
      success: false,
      authenticated: false,
      user: null,
      error: error.message || 'Unknown error',
    }
  }
}




