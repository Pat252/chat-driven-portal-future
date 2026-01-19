/**
 * Not Authorized Page
 * 
 * Displayed when a user is authenticated but not in the allowlist.
 * Session is cleared before redirecting here.
 */

import Link from 'next/link'

export default function NotAuthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-zinc-600 dark:text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
          Access Restricted
        </h1>

        {/* Message */}
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          Your account is not authorized to access this application.
          <br />
          <span className="text-sm text-zinc-500 dark:text-zinc-500">
            Please contact an administrator if you believe this is an error.
          </span>
        </p>

        {/* Action */}
        <div className="space-y-3">
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

