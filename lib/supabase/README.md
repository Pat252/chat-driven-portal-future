# Supabase Integration

This directory contains all Supabase-related utilities and helpers for the application.

## 📁 File Structure

```
lib/supabase/
├── client.ts       # Client-side Supabase client (browser)
├── server.ts       # Server-side Supabase client (RSC, Server Actions)
├── auth.ts         # Authentication helpers (OAuth, sign in/out)
├── middleware.ts   # Middleware helper for session refresh
├── verify.ts       # Connection verification utilities
└── README.md       # This file
```

## 🔧 Setup Instructions

### 1. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**How to get these values:**
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and anon/public key

### 2. Enable Authentication Providers (Optional)

If you want to use OAuth (Google, GitHub, etc.):

1. Go to Authentication → Providers in Supabase dashboard
2. Enable the providers you want (e.g., Google)
3. Configure redirect URLs:
   - Add `http://localhost:3000/auth/callback` for development
   - Add `https://yourdomain.com/auth/callback` for production

## 📖 Usage Examples

### Client-Side (React Components)

```typescript
'use client'

import { supabase } from '@/lib/supabase/client'
import { signInWithGoogle, signOut } from '@/lib/supabase/auth'

// Sign in with Google
const handleGoogleSignIn = async () => {
  try {
    await signInWithGoogle()
  } catch (error) {
    console.error('Error:', error)
  }
}

// Sign out
const handleSignOut = async () => {
  try {
    await signOut()
  } catch (error) {
    console.error('Error:', error)
  }
}

// Query data
const fetchData = async () => {
  const { data, error } = await supabase
    .from('your_table')
    .select('*')
  
  if (error) throw error
  return data
}
```

### Server-Side (Server Components)

```typescript
import { createServerClient, getUser } from '@/lib/supabase/server'

export default async function ServerComponent() {
  // Get current user
  const user = await getUser()
  
  // Or create client for queries
  const supabase = createServerClient()
  const { data } = await supabase.from('your_table').select('*')
  
  return (
    <div>
      {user ? `Hello ${user.email}` : 'Not logged in'}
    </div>
  )
}
```

### Server Actions

```typescript
'use server'

import { createServerClient } from '@/lib/supabase/server'

export async function createItem(formData: FormData) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('items')
    .insert({
      name: formData.get('name'),
    })
  
  if (error) throw error
  return data
}
```

## 🔐 Authentication Helpers

All authentication helpers are available in `auth.ts`:

- `signInWithGoogle()` - Sign in with Google OAuth
- `signInWithGitHub()` - Sign in with GitHub OAuth
- `signInWithEmail(email, password)` - Email/password sign in
- `signUpWithEmail(email, password)` - Email/password sign up
- `signOut()` - Sign out current user
- `getUser()` - Get current authenticated user
- `getSession()` - Get current session
- `onAuthStateChange(callback)` - Listen to auth changes
- `resetPassword(email)` - Reset password
- `updatePassword(newPassword)` - Update password

## ✅ Verification

To verify your Supabase connection is working:

```typescript
import { verifySupabaseConnection, getConnectionStatus } from '@/lib/supabase/verify'

// Simple check
const isConnected = await verifySupabaseConnection()

// Detailed status
const status = await getConnectionStatus()
console.log(status)
```

## 🔒 Security Best Practices

1. **Never expose secret keys** - Only use `NEXT_PUBLIC_SUPABASE_ANON_KEY` in client-side code
2. **Use Row Level Security (RLS)** - Always enable RLS on your tables
3. **Validate on server** - Always validate data in Server Actions, not just client-side
4. **Use Server Components** - Fetch sensitive data in Server Components when possible

## 📚 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js App Router + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

## 🐛 Troubleshooting

### "Missing Supabase environment variables" error
- Make sure `.env.local` exists in the root directory
- Restart your dev server after adding environment variables

### OAuth redirect not working
- Check that the callback URL is correctly configured in Supabase dashboard
- Make sure `app/auth/callback/route.ts` exists

### Session not persisting
- Make sure `middleware.ts` is in the root directory
- Check that the middleware config matches your route structure








