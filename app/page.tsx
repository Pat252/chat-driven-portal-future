import Sidebar from '@/components/Sidebar'
import ChatWindow from '@/components/ChatWindow'
import ChatInput from '@/components/ChatInput'
import ChatHeader from '@/components/chat-header'

export default function Home() {
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

