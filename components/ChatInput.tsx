'use client'

import { Send } from 'lucide-react'

export default function ChatInput() {
  return (
    <div className="border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-[#343541]">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="relative">
          <textarea
            placeholder="Message ChatGPT..."
            className="w-full px-4 py-3 pr-12 bg-white dark:bg-[#40414f] border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:border-gray-400 dark:focus:border-[#565869] text-[#353740] dark:text-[#ececf1] placeholder-[#8e8ea0] dark:placeholder-[#9a9aab] max-h-32 shadow-sm"
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = `${Math.min(target.scrollHeight, 128)}px`
            }}
          />
          <button
            className="absolute right-2 bottom-2.5 p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-[#565869] text-[#8e8ea0] dark:text-[#9a9aab] hover:text-[#353740] dark:hover:text-[#ececf1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-[#8e8ea0] dark:text-[#9a9aab] mt-2 text-center px-4">
          ChatGPT can make mistakes. Check important info.
        </p>
      </div>
    </div>
  )
}

