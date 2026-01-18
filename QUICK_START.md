# 🚀 Quick Start - Supabase Integration

## ⚡ Get Started in 3 Steps

### Step 1: Add Your Supabase Credentials

Create `.env.local` in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Get these from:** [Supabase Dashboard](https://app.supabase.com) → Your Project → Settings → API

### Step 2: Restart Dev Server

```bash
npm run dev
```

### Step 3: Test Connection

Visit: [http://localhost:3000/api/test-supabase](http://localhost:3000/api/test-supabase)

You should see:
```json
{
  "connected": true,
  "details": { ... }
}
```

---

## 📦 What's Included

### Client-Side Usage (React Components)

```typescript
'use client'
import { supabase, signInWithGoogle } from '@/lib/supabase'

// Sign in
await signInWithGoogle()

// Query data
const { data } = await supabase.from('table').select('*')
```

### Server-Side Usage (Server Components)

```typescript
import { createServerClient, getUser } from '@/lib/supabase'

// Get current user
const user = await getUser()

// Query data
const supabase = createServerClient()
const { data } = await supabase.from('table').select('*')
```

---

## 🔐 Enable OAuth (Optional)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Authentication → Providers
3. Enable Google (or other providers)
4. Add redirect URL: `http://localhost:3000/auth/callback`

---

## 📁 File Structure

```
lib/supabase/
├── index.ts       # Main exports (use this for imports)
├── client.ts      # Browser client
├── server.ts      # Server client
├── auth.ts        # Auth helpers
├── verify.ts      # Connection testing
└── README.md      # Full documentation

app/auth/callback/
└── route.ts       # OAuth callback handler

middleware.ts      # Session refresh
```

---

## 🎯 Common Tasks

### Add Sign In Button

```typescript
'use client'
import { signInWithGoogle } from '@/lib/supabase'

export default function SignInButton() {
  return (
    <button onClick={() => signInWithGoogle()}>
      Sign in with Google
    </button>
  )
}
```

### Add Sign Out Button

```typescript
'use client'
import { signOut } from '@/lib/supabase'

export default function SignOutButton() {
  return (
    <button onClick={() => signOut()}>
      Sign Out
    </button>
  )
}
```

### Show User Info

```typescript
import { getUser } from '@/lib/supabase/server'

export default async function UserProfile() {
  const user = await getUser()
  
  if (!user) return <div>Not signed in</div>
  
  return <div>Welcome, {user.email}</div>
}
```

---

## 🐛 Troubleshooting

**"Missing environment variables" error?**
- Create `.env.local` with your Supabase credentials
- Restart dev server

**OAuth not working?**
- Enable provider in Supabase dashboard
- Add callback URL to OAuth app settings

**Need more help?**
- See `lib/supabase/README.md` for detailed docs
- See `SUPABASE_SETUP.md` for full setup guide

---

## 📚 Next Steps

1. ✅ Add credentials to `.env.local`
2. ✅ Test connection at `/api/test-supabase`
3. Create your database tables in Supabase
4. Enable Row Level Security (RLS)
5. Start building features!

**Full Documentation:** See `lib/supabase/README.md`

