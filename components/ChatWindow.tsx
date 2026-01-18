'use client'

import Suggestions from './Suggestions'

export default function ChatWindow() {
  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-900">
      <div className="max-w-3xl mx-auto">
        {/* Welcome Message */}
        <div className="flex flex-col items-center justify-center min-h-full text-center px-4 py-12">
          <h1 className="text-4xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
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

