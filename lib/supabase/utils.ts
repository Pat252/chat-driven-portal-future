/**
 * Supabase Utility Functions
 * 
 * Helper functions for common authentication patterns.
 */

import { User } from '@supabase/supabase-js'

/**
 * Check if a user is authenticated
 */
export function isAuthenticated(user: User | null): user is User {
  return user !== null
}

/**
 * Get user email safely
 */
export function getUserEmail(user: User | null): string {
  return user?.email || 'Unknown'
}

/**
 * Get user display name (falls back to email)
 */
export function getUserDisplayName(user: User | null): string {
  return user?.user_metadata?.full_name || user?.email || 'User'
}

/**
 * Format user for display
 */
export function formatUserDisplay(user: User | null): string {
  if (!user) return 'Not signed in'
  return `${getUserDisplayName(user)} (${user.email})`
}

