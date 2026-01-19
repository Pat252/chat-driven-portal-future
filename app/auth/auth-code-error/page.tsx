import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-zinc-900">
      <div className="text-center p-8">
        <h1 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
          Authentication Error
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          There was an error during authentication. Please try again.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-zinc-900 dark:bg-zinc-800 text-white rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}







