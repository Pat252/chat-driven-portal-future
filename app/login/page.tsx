/**
 * Login Page
 * 
 * Displays Google Sign-in button.
 * If user is already authenticated, redirects to /chat.
 */

import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { signInWithGoogleAction } from '@/app/auth/actions'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  // Check if user is already authenticated
  const user = await getUser()

  if (user) {
    // Already logged in, redirect to chat
    redirect('/chat')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-md w-full px-6">
        {/* Login Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 border border-zinc-200 dark:border-zinc-800">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Welcome Back
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Sign in to continue to AI Chat Portal
            </p>
          </div>

          {/* Google Sign-in Button */}
          <form action={signInWithGoogleAction} className="space-y-4">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-lg transition-colors font-medium text-zinc-900 dark:text-zinc-100"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </form>

          {/* Privacy Notice */}
          <p className="text-xs text-center text-zinc-500 dark:text-zinc-500 mt-6">
            Used only for identity verification. No tracking. No training.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-600 mt-8">
          AUTHORIZED PERSONNEL ONLY
        </p>
      </div>
    </div>
  )
}

