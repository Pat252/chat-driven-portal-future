/**
 * Supabase - Main Export File
 * 
 * Centralized exports for easy imports throughout the app.
 * 
 * Usage:
 * import { supabase, signInWithGoogle, getUser } from '@/lib/supabase'
 */

// Client-side
export { supabase, isSupabaseConfigured } from './client'

// Server-side
export { createServerClient, getUser, getSession } from './server'

// Authentication
// NOTE: For OAuth (Google, GitHub), use server actions from app/auth/actions.ts
// These client-side helpers are for email/password auth only
export {
  signInWithEmail,
  signUpWithEmail,
  signOut,
  onAuthStateChange,
  resetPassword,
  updatePassword,
} from './auth'

// Verification
export {
  verifySupabaseConnection,
  getConnectionStatus,
  testAuthFlow,
} from './verify'

// Middleware
export { updateSession } from './middleware'








