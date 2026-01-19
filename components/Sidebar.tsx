'use client'

import { useState, useEffect } from 'react'
import { Plus, MessageSquare } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

interface Conversation {
  id: string
  title: string | null
  created_at: string
}

interface SidebarProps {
  activeConversationId: string | null
  onConversationSelect: (conversationId: string) => void
  onNewChat: () => void
  refreshTrigger?: number
}

export default function Sidebar({ activeConversationId, onConversationSelect, onNewChat, refreshTrigger }: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations()
  }, [])

  // Refresh conversations when refreshTrigger changes (e.g., after title generation)
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      // Small delay to allow title generation to complete
      const timer = setTimeout(() => {
        fetchConversations()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [refreshTrigger])

  const fetchConversations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/conversations')
      
      if (!response.ok) {
        console.error('Failed to fetch conversations:', await response.text())
        return
      }

      const data = await response.json()
      setConversations(data.conversations || [])
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh conversations when a new conversation is created
  useEffect(() => {
    if (activeConversationId && !conversations.find(c => c.id === activeConversationId)) {
      fetchConversations()
    }
  }, [activeConversationId, conversations])

  const getConversationTitle = (conversation: Conversation) => {
    return conversation.title || 'New Conversation'
  }

  return (
    <div className="w-64 bg-zinc-50 dark:bg-zinc-950 flex flex-col h-full border-r border-gray-200 dark:border-zinc-800">
      {/* New Chat Button */}
      <div className="p-2">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-md border border-gray-300 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors text-zinc-900 dark:text-zinc-100"
        >
          <Plus className="w-4 h-4" />
          New chat
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {isLoading ? (
          <div className="text-xs text-zinc-400 dark:text-zinc-500 px-3 py-2">
            Loading...
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-xs text-zinc-400 dark:text-zinc-500 px-3 py-2">
            No conversations yet
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onConversationSelect(conversation.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-colors text-left ${
                  activeConversationId === conversation.id
                    ? 'bg-gray-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                    : 'hover:bg-gray-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{getConversationTitle(conversation)}</span>
              </button>
            ))}
          </div>
        )}
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

