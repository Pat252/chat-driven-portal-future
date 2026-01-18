'use client'

import { Send } from 'lucide-react'

export default function ChatInput() {
  return (
    <div className="border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="relative">
          <textarea
            placeholder="Message ChatGPT..."
            className="w-full px-4 py-3 pr-12 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl resize-none focus:outline-none focus:border-gray-400 dark:focus:border-zinc-600 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 max-h-32 shadow-sm"
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = `${Math.min(target.scrollHeight, 128)}px`
            }}
          />
          <button
            className="absolute right-2 bottom-2.5 p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2 text-center px-4">
          ChatGPT can make mistakes. Check important info.
        </p>
      </div>
    </div>
  )
}

