/**
 * Supabase Authentication Helpers
 * 
 * This file contains reusable authentication functions for:
 * - OAuth (Google, GitHub, etc.)
 * - Email/Password auth
 * - Sign out
 * - Session management
 * 
 * Usage in client components:
 * import { signInWithGoogle, signOut } from '@/lib/supabase/auth'
 */

import { supabase } from './client'
import type { Provider } from '@supabase/supabase-js'

/**
 * DEPRECATED: OAuth should now be handled via server actions
 * See app/auth/actions.ts for signInWithGoogleAction()
 * 
 * These functions are kept for backward compatibility but should not be used.
 * Client-side OAuth calls can cause issues with PKCE flow and cookie handling.
 */

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Error signing in with email:', error.message)
    throw error
  }

  return data
}

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${location.protocol}//${location.host}/auth/callback`,
    },
  })

  if (error) {
    console.error('Error signing up:', error.message)
    throw error
  }

  return data
}

/**
 * Sign out the current user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error signing out:', error.message)
    throw error
  }

  // Redirect to home page after sign out
  window.location.href = '/'
}

/**
 * Get the current user session
 */
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Error getting session:', error.message)
    return null
  }

  return session
}

/**
 * Get the current authenticated user
 */
export const getUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error getting user:', error.message)
    return null
  }

  return user
}

/**
 * Listen to auth state changes
 * Returns unsubscribe function
 */
export const onAuthStateChange = (
  callback: (event: string, session: any) => void
) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
  
  return () => subscription.unsubscribe()
}

/**
 * Reset password for email
 */
export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${location.protocol}//${location.host}/auth/reset-password`,
  })

  if (error) {
    console.error('Error resetting password:', error.message)
    throw error
  }

  return data
}

/**
 * Update user password
 */
export const updatePassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    console.error('Error updating password:', error.message)
    throw error
  }

  return data
}

