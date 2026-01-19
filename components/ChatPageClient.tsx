'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import ChatWindow from './ChatWindow'

export default function ChatPageClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Load conversationId from URL on mount
  useEffect(() => {
    const urlConversationId = searchParams.get('conversationId')
    if (urlConversationId) {
      setActiveConversationId(urlConversationId)
    }
  }, [searchParams])

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId)
    router.push(`/chat?conversationId=${conversationId}`)
  }

  const handleNewChat = () => {
    setActiveConversationId(null)
    router.push('/chat')
  }

  const handleConversationCreated = (conversationId: string) => {
    setActiveConversationId(conversationId)
  }

  const handleMessageSent = () => {
    // Trigger sidebar refresh after a delay to allow title generation
    setTimeout(() => {
      setRefreshTrigger(prev => prev + 1)
    }, 1000)
  }

  return (
    <div className="flex h-screen text-zinc-900 dark:text-zinc-100 overflow-hidden bg-white dark:bg-zinc-900">
      <Sidebar 
        activeConversationId={activeConversationId}
        onConversationSelect={handleConversationSelect}
        onNewChat={handleNewChat}
        refreshTrigger={refreshTrigger}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <ChatWindow 
            initialConversationId={activeConversationId}
            onConversationCreated={handleConversationCreated}
            onMessageSent={handleMessageSent}
          />
        </div>
      </div>
    </div>
  )
}

