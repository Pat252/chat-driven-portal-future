'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import ThemeToggle from './theme-toggle'
import { useRouter } from 'next/navigation'
import { LogOut, ChevronDown } from 'lucide-react'

type ModelKey = 'llama3.1:8b' | 'deepseek-r1:7b'

interface ChatHeaderProps {
  selectedModel: ModelKey
  onModelChange: (model: ModelKey) => void
  modelLabels: Record<ModelKey, string>
}

export default function ChatHeader({ selectedModel, onModelChange, modelLabels }: ChatHeaderProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false)

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error.message)
      return
    }
    router.push('/login')
    router.refresh()
  }

  const handleModelSelect = (model: ModelKey) => {
    onModelChange(model)
    setIsModelDropdownOpen(false)
  }

  // Extract badge info from model
  const getBadgeInfo = (modelKey: ModelKey) => {
    if (modelKey === 'deepseek-r1:7b') {
      return { text: 'Reasoning', color: 'text-indigo-600 dark:text-indigo-400' }
    } else {
      return { text: 'Fast', color: 'text-green-600 dark:text-green-400' }
    }
  }

  // Parse label to get model name without badge
  const getModelName = (label: string) => {
    return label.split(' · ')[0]
  }

  const currentBadge = getBadgeInfo(selectedModel)

  return (
    <div className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="max-w-3xl mx-auto px-4 py-2 flex justify-between items-center gap-2">
        {/* Left Side - Model Selector */}
        <div className="relative">
          <button
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
            aria-label="Select model"
          >
            <span>{getModelName(modelLabels[selectedModel])}</span>
            <span className={`text-xs font-medium ${currentBadge.color}`}>
              ● {currentBadge.text}
            </span>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {isModelDropdownOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsModelDropdownOpen(false)}
              />
              
              {/* Dropdown */}
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-20 min-w-[200px]">
                {Object.entries(modelLabels).map(([modelKey, label]) => {
                  const badge = getBadgeInfo(modelKey as ModelKey)
                  return (
                    <button
                      key={modelKey}
                      onClick={() => handleModelSelect(modelKey as ModelKey)}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                        selectedModel === modelKey
                          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <span>{getModelName(label)}</span>
                      <span className={`text-xs font-medium ${badge.color}`}>
                        ● {badge.text}
                      </span>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
        
        {/* Right Side - User Info & Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {user && (
            <div className="hidden sm:block text-sm text-zinc-600 dark:text-zinc-400">
              Signed in as <strong className="text-zinc-900 dark:text-zinc-100">{user.email}</strong>
            </div>
          )}
          <ThemeToggle />
          {user && (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}








