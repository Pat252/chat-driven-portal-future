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
 * Sign in with OAuth provider (Google, GitHub, etc.)
 * Redirects user to OAuth provider's consent screen
 * Uses NEXT_PUBLIC_SITE_URL to ensure correct redirect URL when accessed via tunnel
 */
export const signInWithOAuth = async (provider: Provider) => {
  console.log('OAuth initiated via Supabase')
  // Use NEXT_PUBLIC_SITE_URL with fallback - safe for client-side
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chat.aidrivenfuture.ca'
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error) {
    console.error(`Error signing in with ${provider}:`, error.message)
    throw error
  }

  return data
}

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async () => {
  return signInWithOAuth('google')
}

/**
 * Sign in with GitHub OAuth
 */
export const signInWithGitHub = async () => {
  return signInWithOAuth('github')
}

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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chat.aidrivenfuture.ca'
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chat.aidrivenfuture.ca'
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/reset-password`,
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

