'use client'

const suggestions = [
  {
    text: "Explain quantum computing in simple terms",
  },
  {
    text: "Got any creative ideas for a 10 year old's birthday?",
  },
  {
    text: "How do I make an HTTP request in JavaScript?",
  },
  {
    text: "Write a Python script to analyze sales data",
  },
]

export default function Suggestions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8 w-full max-w-2xl">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          className="p-4 rounded-lg border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-left group"
        >
          <p className="text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-800 dark:group-hover:text-zinc-50">
            {suggestion.text}
          </p>
        </button>
      ))}
    </div>
  )
}

