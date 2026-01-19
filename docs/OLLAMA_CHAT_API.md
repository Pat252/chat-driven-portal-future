# Ollama Chat API - Usage Guide

## ✅ Implementation Complete

The streaming chat API route has been created at `/api/chat`.

---

## 📍 Endpoint

```
POST /api/chat
```

---

## 📥 Request Format

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "message": "What is the capital of France?",
  "model": "llama3.1:8b"  // Optional, defaults to llama3.1:8b
}
```

### Model Options
- `llama3.1:8b` (default) - General-purpose chat
- `deepseek-r1:7b` - Reasoning model

---

## 📤 Response Format

**Content-Type:** `text/plain; charset=utf-8`

**Streaming:** Responses are streamed token-by-token as they're generated.

---

## 🧪 Testing

### Using cURL

```bash
# Default model (llama3.1:8b)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'

# Specific model
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Explain quantum computing", "model": "deepseek-r1:7b"}'
```

### Using JavaScript (Fetch API)

```javascript
async function streamChat(message, model = 'llama3.1:8b') {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, model }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Request failed')
  }

  // Stream the response
  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    
    if (done) break

    // Decode and display token
    const chunk = decoder.decode(value, { stream: true })
    console.log(chunk) // Or append to UI
  }
}

// Usage
await streamChat('What is the capital of France?')
```

### Using React (with useState)

```typescript
'use client'

import { useState } from 'react'

export function ChatComponent() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResponse('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      if (!res.ok) {
        throw new Error('Request failed')
      }

      // Stream the response
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) return

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        setResponse((prev) => prev + chunk)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button type="submit" disabled={loading}>
        Send
      </button>
      <div>{response}</div>
    </form>
  )
}
```

---

## 🔧 Features

### ✅ Streaming
- Responses stream token-by-token
- No waiting for complete response
- Real-time display possible

### ✅ Model Selection
- Default: `llama3.1:8b`
- Optional: `deepseek-r1:7b` or any other Ollama model
- Pass `model` in request body

### ✅ Error Handling
- Validates message (required, non-empty)
- Validates model (must be string)
- Handles Ollama connection errors
- Returns appropriate HTTP status codes

### ✅ Abort Handling
- Supports client-side request cancellation
- Cleans up resources on abort
- Returns 499 status on abort

---

## 📊 Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success (streaming response) |
| 400 | Bad request (invalid message or model) |
| 500 | Internal server error |
| 499 | Request aborted by client |

---

## 🚨 Requirements

### Ollama Must Be Running

Ensure Ollama is running locally:

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not running, start Ollama
ollama serve
```

### Models Must Be Available

Ensure models are pulled:

```bash
# Pull default model
ollama pull llama3.1:8b

# Pull optional model
ollama pull deepseek-r1:7b
```

---

## 🔍 Debugging

### Check Ollama Connection

```bash
# Test Ollama directly
curl http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.1:8b",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": true
  }'
```

### Check API Route

```bash
# Test API route
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

### Server Logs

Check Next.js server logs for:
- `[Chat API] Ollama error:` - Connection issues
- `[Chat API] Stream error:` - Streaming errors
- `[Chat API] Request aborted` - Client cancellations

---

## 📝 Example Responses

### Success (Streaming)
```
The
 capital
 of
 France
 is
 Paris
.
```

### Error (JSON)
```json
{
  "error": "Message is required and must be a non-empty string"
}
```

---

## 🎯 Next Steps

1. **Integrate with Chat UI**
   - Update `ChatInput` component to call `/api/chat`
   - Display streaming responses in `ChatWindow`
   - Add model selector dropdown

2. **Add Conversation History** (optional)
   - Store messages in Supabase
   - Pass conversation context to Ollama
   - Maintain chat history

3. **Add Error UI**
   - Show error messages to users
   - Handle connection failures gracefully
   - Retry mechanism

---

## ✅ Acceptance Criteria Met

- [x] `/api/chat` streams text progressively
- [x] Default model is `llama3.1:8b`
- [x] Passing `"model": "deepseek-r1:7b"` works
- [x] No TypeScript or runtime errors
- [x] Clean, readable, production-quality code
- [x] Handles client aborts cleanly
- [x] Uses ReadableStream and Fetch API
- [x] No Supabase writes
- [x] No conversation management

---

**Ready to use!** 🚀

