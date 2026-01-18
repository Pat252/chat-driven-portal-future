'use client'

import { Plus } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function Sidebar() {
  return (
    <div className="w-64 bg-zinc-50 dark:bg-zinc-950 flex flex-col h-full border-r border-gray-200 dark:border-zinc-800">
      {/* New Chat Button */}
      <div className="p-2">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-md border border-gray-300 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors text-zinc-900 dark:text-zinc-100">
          <Plus className="w-4 h-4" />
          New chat
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-1">
          {/* Chat history will appear here */}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-2 border-t border-gray-200 dark:border-zinc-800">
        <ThemeToggle />
        <div className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400 truncate">
          User
        </div>
      </div>
    </div>
  )
}

