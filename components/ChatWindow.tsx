'use client'

import Suggestions from './Suggestions'

export default function ChatWindow() {
  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-[#343541]">
      <div className="max-w-3xl mx-auto">
        {/* Welcome Message */}
        <div className="flex flex-col items-center justify-center min-h-full text-center px-4 py-12">
          <h1 className="text-4xl font-semibold mb-4 text-[#353740] dark:text-[#ececf1]">
            How can I help ?
          </h1>
          <Suggestions />
        </div>

        {/* Chat Messages Area */}
        <div className="space-y-4 px-4">
          {/* Messages will appear here */}
        </div>
      </div>
    </div>
  )
}

