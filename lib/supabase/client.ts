/**
 * Supabase Client - Browser/Client-Side
 * 
 * This client is used for client-side operations in React components.
 * Uses @supabase/ssr's createBrowserClient for proper cookie handling.
 * 
 * Usage:
 * import { supabase } from '@/lib/supabase/client'
 * const { data, error } = await supabase.from('table').select()
 */

import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.')
}

/**
 * Browser client with automatic cookie synchronization
 * This ensures SSR and CSR sessions stay in sync
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

/**
 * Check if Supabase client is properly configured
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey)
}








