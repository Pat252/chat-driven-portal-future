'use client'

import AuthButton from './auth-button'
import ThemeToggle from './theme-toggle'

export default function ChatHeader() {
  return (
    <div className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="max-w-3xl mx-auto px-4 py-2 flex justify-end items-center gap-2">
        <AuthButton />
        <ThemeToggle />
      </div>
    </div>
  )
}

