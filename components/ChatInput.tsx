'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`
    }
  }, [input])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedInput = input.trim()
    if (!trimmedInput || disabled) return

    onSend(trimmedInput)
    setInput('')
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter without Shift → submit
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
    // Shift + Enter → new line (default behavior)
  }

  const isSendDisabled = !input.trim() || disabled

  return (
    <div className="border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message ChatGPT..."
              className="w-full px-4 py-3 pr-12 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl resize-none focus:outline-none focus:border-gray-400 dark:focus:border-zinc-600 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 max-h-32 shadow-sm"
              rows={1}
              disabled={disabled}
            />
            <button
              type="submit"
              disabled={isSendDisabled}
              className="absolute right-2 bottom-2.5 p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2 text-center px-4">
          ChatGPT can make mistakes. Check important info.
        </p>
      </div>
    </div>
  )
}

