import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import ChatPageClient from '@/components/ChatPageClient'

// Force dynamic rendering to ensure cookies are read on every request
export const dynamic = 'force-dynamic'

/**
 * Chat Page with Allowlist Enforcement
 * 
 * Access control:
 * - Non-authenticated users → redirect to /login
 * - Authenticated but not in allowlist → sign out + redirect to /not-authorized
 * - Authenticated and in allowlist → show chat interface
 */
export default async function ChatPage() {
  const supabase = createServerClient()

  // Step 1: Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // If not authenticated, redirect to login
  if (!user || authError) {
    redirect('/login')
  }

  // Step 2: Check if user email exists in allowed_users table
  const { data: allowedUser, error: allowlistError } = await supabase
    .from('allowed_users')
    .select('email')
    .eq('email', user.email)
    .single()

  // If user is not in allowlist, sign them out and redirect
  if (!allowedUser || allowlistError) {
    console.log(`[Chat] Access denied for: ${user.email}`)
    
    // Sign out the user (clear session)
    await supabase.auth.signOut()
    
    // Redirect to not-authorized page
    redirect('/not-authorized')
  }

  // Step 3: User is authenticated and in allowlist - show chat
  console.log(`[Chat] Access granted for: ${user.email}`)

  return <ChatPageClient />
}

