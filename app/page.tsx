import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'

// Force dynamic rendering to ensure cookies are read on every request
export const dynamic = 'force-dynamic'

/**
 * Home Page (/)
 * 
 * Redirects based on authentication state:
 * - Authenticated: /chat
 * - Not authenticated: /login
 */
export default async function Home() {
  const user = await getUser()

  // If authenticated, redirect to /chat
  if (user) {
    redirect('/chat')
  }

  // Not authenticated, redirect to /login
  redirect('/login')
}
