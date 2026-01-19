/**
 * Navbar Component
 * 
 * Displays navigation and authentication state.
 * Receives user from server-side props for SSR.
 * Uses client-side Supabase for logout action.
 */

'use client'

import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, User as UserIcon } from 'lucide-react'

interface NavbarProps {
  user: User | null
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Error signing out:', error.message)
      alert(`Error signing out: ${error.message}`)
      return
    }

    // Redirect to login page
    router.push('/login')
    router.refresh() // Refresh to update SSR state
  }

  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Title */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              AI Chat Portal
            </h1>
          </div>

          {/* Auth State */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* User Info */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-100 dark:bg-zinc-800">
                  <UserIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    Signed in as <strong>{user.email}</strong>
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Not signed in
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

