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
          className="p-4 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#40414f] transition-colors cursor-pointer text-left group"
        >
          <p className="text-sm text-[#353740] dark:text-[#ececf1] group-hover:text-[#2d2d2d] dark:group-hover:text-[#ececf1]">
            {suggestion.text}
          </p>
        </button>
      ))}
    </div>
  )
}

