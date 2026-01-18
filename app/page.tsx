import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import LandingPage from '@/components/LandingPage'

// Force dynamic rendering to ensure cookies are read on every request
export const dynamic = 'force-dynamic'

export default async function Home() {
  const user = await getUser()

  // If authenticated, redirect to /chat
  if (user) {
    redirect('/chat')
  }

  // Show landing page for unauthenticated users
  return <LandingPage />
}
