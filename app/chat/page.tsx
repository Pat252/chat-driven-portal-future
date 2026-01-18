import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'
import ChatWindow from '@/components/ChatWindow'
import ChatInput from '@/components/ChatInput'
import ChatHeader from '@/components/chat-header'

// Force dynamic rendering to ensure cookies are read on every request
export const dynamic = 'force-dynamic'

export default async function ChatPage() {
  const user = await getUser()

  // Protect route - redirect to landing if not authenticated
  if (!user) {
    redirect('/')
  }

  return (
    <div className="flex h-screen text-zinc-900 dark:text-zinc-100 overflow-hidden bg-white dark:bg-zinc-900">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <ChatHeader />
        <ChatWindow />
        <ChatInput />
      </div>
    </div>
  )
}

