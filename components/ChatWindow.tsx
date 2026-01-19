'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, Trash2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import Suggestions from './Suggestions'
import ChatInput from './ChatInput'
import ChatHeader from './chat-header'

interface Message {
  id?: string
  role: 'user' | 'assistant'
  content: string
}

const MODELS = {
  'deepseek-r1:7b': 'DeepSeek R1 (7B) · Reasoning',
  'llama3.1:8b': 'Llama 3.1 (8B) · Fast',
} as const

type ModelKey = keyof typeof MODELS

interface ChatWindowProps {
  initialConversationId: string | null
  onConversationCreated?: (conversationId: string) => void
  onMessageSent?: () => void
}

export default function ChatWindow({ initialConversationId, onConversationCreated, onMessageSent }: ChatWindowProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<ModelKey>('deepseek-r1:7b')
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null)
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const menuRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})

  // Update conversationId when initialConversationId changes (conversation switch)
  useEffect(() => {
    if (initialConversationId !== conversationId) {
      setConversationId(initialConversationId)
      // Clear messages when switching to a new conversation or starting fresh
      if (initialConversationId === null) {
        setMessages([])
      }
    }
  }, [initialConversationId])

  // Load message history when conversationId changes
  useEffect(() => {
    if (!conversationId) {
      setMessages([])
      return
    }

    const loadMessages = async () => {
      setIsLoadingHistory(true)
      try {
        const response = await fetch(`/api/conversations/${conversationId}/messages`)
        
        if (!response.ok) {
          console.error('Failed to load message history:', await response.text())
          setMessages([])
          return
        }

        const data = await response.json()
        setMessages(data.messages || [])
      } catch (error) {
        console.error('Error loading message history:', error)
        setMessages([])
      } finally {
        setIsLoadingHistory(false)
      }
    }

    loadMessages()
  }, [conversationId])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuIndex !== null) {
        const menuElement = menuRefs.current[openMenuIndex]
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setOpenMenuIndex(null)
        }
      }
    }

    if (openMenuIndex !== null) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openMenuIndex])

  const handleDeleteMessage = async (messageIndex: number) => {
    const message = messages[messageIndex]
    
    // Only delete if message has an ID (saved messages)
    if (!message.id) {
      // Optimistically remove unsaved messages
      setMessages((prev) => prev.filter((_, idx) => idx !== messageIndex))
      setOpenMenuIndex(null)
      return
    }

    // Optimistically remove from UI
    const previousMessages = [...messages]
    setMessages((prev) => prev.filter((_, idx) => idx !== messageIndex))
    setOpenMenuIndex(null)

    try {
      const response = await fetch(`/api/messages/${message.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        // Restore message on failure
        setMessages(previousMessages)
        const error = await response.json().catch(() => ({ error: 'Failed to delete message' }))
        throw new Error(error.error || 'Failed to delete message')
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      // Restore message on failure
      setMessages(previousMessages)
      alert(error instanceof Error ? error.message : 'Failed to delete message')
    }
  }

  const handleSend = async (message: string) => {
    // Add user message immediately
    const userMessage: Message = { role: 'user', content: message }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Call /api/chat with selected model and conversationId
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message, 
          model: selectedModel,
          conversationId: conversationId,
        }),
      })

      // Extract conversationId from response header
      const responseConversationId = response.headers.get('X-Conversation-Id')
      if (responseConversationId && responseConversationId !== conversationId) {
        setConversationId(responseConversationId)
        // Update URL to include conversationId for refresh support
        router.replace(`/chat?conversationId=${responseConversationId}`)
        // Notify parent component that a new conversation was created
        if (onConversationCreated) {
          onConversationCreated(responseConversationId)
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(error.error || 'Failed to get response')
      }

      // Initialize assistant message
      const assistantMessage: Message = { role: 'assistant', content: '' }
      setMessages((prev) => [...prev, assistantMessage])

      // Stream the response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        // Decode chunk and append to assistant message
        const chunk = decoder.decode(value, { stream: true })
        
        setMessages((prev) => {
          const updated = [...prev]
          const lastMessage = updated[updated.length - 1]
          
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content += chunk
          }
          
          return updated
        })
      }

      // Notify parent that message was sent (for sidebar refresh)
      if (onMessageSent) {
        onMessageSent()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
      {/* Chat Header with Model Selector */}
      <ChatHeader 
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        modelLabels={MODELS}
      />
      
      {/* Scrollable messages area */}
      <div className="flex-1 overflow-y-auto overflow-x-visible">
        <div className="max-w-3xl mx-auto relative">
          {messages.length === 0 ? (
            // Welcome screen with suggestions (only when no messages)
            <div className="flex flex-col items-center justify-center min-h-full text-center px-4 py-12">
              <h1 className="text-4xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                How can I help ?
              </h1>
              <Suggestions />
            </div>
          ) : (
            // Messages list
            <div className="space-y-4 px-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`flex items-start gap-2 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                  onMouseEnter={() => setHoveredMessageIndex(index)}
                  onMouseLeave={() => setHoveredMessageIndex(null)}
                >
                  <div
                    className={`relative max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    {/* 3-dot menu button - positioned absolutely inside message bubble */}
                    <div className="absolute top-1 right-1 z-50" ref={(el) => (menuRefs.current[index] = el)}>
                      <button
                        onClick={() => setOpenMenuIndex(openMenuIndex === index ? null : index)}
                        className={`w-8 h-8 flex items-center justify-center rounded-md transition-all duration-150 ${
                          message.role === 'user'
                            ? 'hover:bg-blue-700 text-white'
                            : 'hover:bg-gray-300 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
                        }`}
                        style={{
                          opacity: hoveredMessageIndex === index || openMenuIndex === index ? 1 : 0,
                          visibility: hoveredMessageIndex === index || openMenuIndex === index ? 'visible' : 'hidden',
                          pointerEvents: 'auto'
                        }}
                        aria-label="Message options"
                      >
                        <MoreVertical className="w-5 h-5" strokeWidth={2} />
                      </button>
                      {/* Menu dropdown */}
                      {openMenuIndex === index && (
                        <div 
                          className={`absolute ${
                            message.role === 'user' ? 'right-0' : 'left-0'
                          } top-full mt-1 w-32 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg z-50`}
                          style={{ pointerEvents: 'auto' }}
                          onMouseEnter={() => setOpenMenuIndex(index)}
                          onMouseLeave={() => setOpenMenuIndex(null)}
                        >
                          <button
                            onClick={() => handleDeleteMessage(index)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Message content */}
                    {message.role === 'user' ? (
                      <div className="whitespace-pre-wrap break-words pr-8">
                        {message.content}
                      </div>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none break-words pr-8">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="ml-4">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            h1: ({ children }) => <h1 className="text-xl font-bold mb-2 mt-4 first:mt-0">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-base font-bold mb-1 mt-2 first:mt-0">{children}</h3>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-200 dark:bg-zinc-800 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
      
      {/* Fixed input at bottom */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  )
}

