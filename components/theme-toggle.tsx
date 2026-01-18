'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors" aria-label="Toggle theme">
        <Sun className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-zinc-400 hover:text-zinc-300" />
      ) : (
        <Moon className="w-5 h-5 text-zinc-600 hover:text-zinc-700" />
      )}
    </button>
  )
}

