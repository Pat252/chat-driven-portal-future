import Sidebar from '@/components/Sidebar'
import ChatWindow from '@/components/ChatWindow'
import ChatInput from '@/components/ChatInput'

export default function Home() {
  return (
    <div className="flex h-screen text-[#353740] dark:text-[#ececf1] overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <ChatWindow />
        <ChatInput />
      </div>
    </div>
  )
}

