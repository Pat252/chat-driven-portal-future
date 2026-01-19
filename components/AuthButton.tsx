/**
 * Auth Button Component
 * 
 * Displays user info when authenticated, or a sign-in button when not.
 * Uses server actions for authentication (no client-side OAuth calls).
 */

'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { signInWithGoogleAction, signOutAction } from '@/app/auth/actions'

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2">
        <div className="h-2 w-2 bg-zinc-400 rounded-full animate-pulse"></div>
        <span className="text-sm text-zinc-400">Loading...</span>
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-3 px-4 py-2">
        <div className="flex items-center gap-2">
          {user.user_metadata?.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt={user.email || 'User'}
              className="h-8 w-8 rounded-full"
            />
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {user.user_metadata?.full_name || user.email}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {user.email}
            </span>
          </div>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    )
  }

  return (
    <form action={signInWithGoogleAction}>
      <button
        type="submit"
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
      >
        Sign in with Google
      </button>
    </form>
  )
}

