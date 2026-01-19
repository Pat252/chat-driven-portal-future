# 🔍 COMPREHENSIVE OAUTH FLOW AUDIT REPORT

**Date:** Generated  
**Project:** chat-ai-driven-future-portal  
**Focus:** Google OAuth Login Flow

---

## 📊 FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                    GOOGLE OAUTH LOGIN FLOW                       │
└─────────────────────────────────────────────────────────────────┘

1. USER ACTION
   └─> User visits: / (landing page)
       └─> app/page.tsx (Server Component)
           ├─> Checks: getUser() from lib/supabase/server.ts
           ├─> If authenticated: redirect('/chat')
           └─> If not: Render <LandingPage />

2. OAUTH INITIATION (3 Entry Points)
   ├─> components/LandingPage.tsx
   │   └─> handleSignIn()
   │       └─> supabase.auth.signInWithOAuth({
   │           provider: 'google',
   │           options: { redirectTo: <NODE_ENV based> }
   │       })
   │
   ├─> components/auth-button.tsx
   │   └─> handleSignIn()
   │       └─> supabase.auth.signInWithOAuth({
   │           provider: 'google',
   │           options: { redirectTo: <NODE_ENV based> }
   │       })
   │
   └─> lib/supabase/auth.ts
       └─> signInWithOAuth('google')
           └─> supabase.auth.signInWithOAuth({
               provider: 'google',
               options: { redirectTo: <NODE_ENV based> }
           })

3. REDIRECT LOGIC
   └─> redirectTo determination:
       ├─> Development: 'http://localhost:3000/auth/callback'
       └─> Production: 'https://chat.aidrivenfuture.ca/auth/callback'

4. SUPABASE OAUTH FLOW
   └─> Browser redirects to:
       └─> https://<PROJECT>.supabase.co/auth/v1/authorize?provider=google&redirect_to=<redirectTo>
           └─> Supabase redirects to Google OAuth
               └─> User approves
                   └─> Google redirects back to Supabase
                       └─> Supabase redirects to: <redirectTo>?code=XXXX

5. CALLBACK HANDLING
   └─> app/auth/callback/route.ts (Route Handler)
       ├─> Middleware: EXCLUDED (not intercepted)
       ├─> Reads: request.url, headers (x-forwarded-host, etc.)
       ├─> Parses: code from searchParams
       ├─> Creates: NextResponse.redirect(`${siteUrl}/chat`)
       ├─> Creates: Supabase SSR client with cookie handlers
       ├─> Calls: supabase.auth.exchangeCodeForSession(code)
       ├─> Sets: Cookies via response.cookies.set()
       └─> Returns: Redirect response with cookies

6. POST-AUTH ROUTING
   └─> Redirect to: /chat
       └─> app/chat/page.tsx (Server Component)
           ├─> Middleware: Runs (refreshes session)
           ├─> Checks: getUser() from lib/supabase/server.ts
           ├─> If authenticated: Render chat UI
           └─> If not: redirect('/')

7. SESSION PERSISTENCE
   └─> Cookies: sb-<project>-auth-token (set by callback route)
       └─> Available to:
           ├─> Middleware (lib/supabase/middleware.ts)
           ├─> Server Components (lib/supabase/server.ts)
           └─> Client Components (lib/supabase/client.ts)
```

---

## 📁 FILES PARTICIPATING IN OAUTH FLOW

### **Entry Points (OAuth Initiation)**
1. **`components/LandingPage.tsx`** - Landing page sign-in button
2. **`components/auth-button.tsx`** - Header auth button
3. **`lib/supabase/auth.ts`** - Reusable OAuth helper function

### **Routing & Protection**
4. **`app/page.tsx`** - Landing page (redirects authenticated users)
5. **`app/chat/page.tsx`** - Protected chat page (redirects unauthenticated users)

### **Callback Handler**
6. **`app/auth/callback/route.ts`** - OAuth callback route handler

### **Middleware**
7. **`middleware.ts`** - Next.js middleware entry point
8. **`lib/supabase/middleware.ts`** - Session refresh logic

### **Supabase Clients**
9. **`lib/supabase/client.ts`** - Browser/client-side Supabase client
10. **`lib/supabase/server.ts`** - Server-side Supabase client (Server Components)
11. **`lib/supabase/middleware.ts`** - Middleware Supabase client

---

## 🔴 PROBLEMS DETECTED

### **CRITICAL ISSUES**

#### **1. Inconsistent Redirect URL Logic**
**Problem:** OAuth calls use `NODE_ENV` but callback route uses `NEXT_PUBLIC_SITE_URL`

- **OAuth calls** (LandingPage, auth-button, auth.ts):
  ```typescript
  const redirectTo = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/auth/callback'
    : 'https://chat.aidrivenfuture.ca/auth/callback'
  ```

- **Callback route** (app/auth/callback/route.ts):
  ```typescript
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? reconstructedOrigin).replace(/\/$/, '')
  ```

**Impact:** If `NEXT_PUBLIC_SITE_URL` is not set in production, callback might redirect to wrong URL.

**Severity:** 🔴 HIGH

---

#### **2. Potential Redirect Loop After OAuth**
**Problem:** After callback redirects to `/chat`, the `/chat` page checks auth and might redirect back to `/` if cookies aren't immediately available.

**Flow:**
1. Callback sets cookies → redirects to `/chat`
2. `/chat` page loads → calls `getUser()`
3. If cookies not yet readable → `getUser()` returns `null`
4. `/chat` redirects to `/`
5. `/` checks auth → might still see session → redirects to `/chat`
6. **LOOP**

**Severity:** 🟡 MEDIUM

---

#### **3. Missing Environment Variable Validation**
**Problem:** No validation that required env vars are set before OAuth calls.

**Missing:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (optional but recommended)

**Severity:** 🟡 MEDIUM

---

#### **4. Callback Route Uses Fallback Instead of NODE_ENV**
**Problem:** Callback route uses `NEXT_PUBLIC_SITE_URL ?? reconstructedOrigin` instead of consistent `NODE_ENV` logic.

**Impact:** Inconsistent behavior between OAuth initiation and callback handling.

**Severity:** 🟡 MEDIUM

---

### **MINOR ISSUES**

#### **5. No Error Handling for Missing Code**
**Problem:** Callback route redirects to error page if no code, but doesn't log why.

**Severity:** 🟢 LOW

---

#### **6. Debug Logging in Production**
**Problem:** Extensive console.log statements in callback route (should be conditional).

**Severity:** 🟢 LOW

---

## ✅ VALIDATION RESULTS

### **1. redirectTo Values** ✅
- **LandingPage.tsx:** ✅ Uses NODE_ENV
- **auth-button.tsx:** ✅ Uses NODE_ENV
- **lib/supabase/auth.ts:** ✅ Uses NODE_ENV
- **Callback route:** ⚠️ Uses NEXT_PUBLIC_SITE_URL (inconsistent)

### **2. Google Client Configuration Match** ✅
- All OAuth calls use:
  - Dev: `http://localhost:3000/auth/callback`
  - Prod: `https://chat.aidrivenfuture.ca/auth/callback`
- **Action Required:** Verify these URLs are in Google Cloud Console

### **3. Server vs Client Redirects** ✅
- **Client-side:** OAuth initiation (all correct)
- **Server-side:** Callback route redirect (correct)
- **No conflicts detected**

### **4. Middleware Override** ✅
- Middleware correctly excludes `/auth/callback`
- No redirect logic in middleware

### **5. Environment Variable Consistency** ⚠️
- OAuth calls: Use `NODE_ENV`
- Callback route: Uses `NEXT_PUBLIC_SITE_URL`
- **Inconsistency detected**

### **6. Provider & redirectTo Agreement** ✅
- All use `provider: 'google'`
- All use environment-based `redirectTo`
- **Agreement confirmed**

### **7. Duplicate/Outdated Calls** ✅
- No duplicates found
- All calls updated correctly

### **8. Callback Route Reachability** ✅
- Route exists: `app/auth/callback/route.ts`
- Middleware excludes it
- Returns session correctly

### **9. Post-OAuth Redirect** ⚠️
- Callback redirects to `/chat` ✅
- `/chat` checks auth ✅
- **Potential timing issue with cookies**

---

## 🔧 RECOMMENDED FIXES

### **FIX 1: Standardize Redirect URL Logic**

**File:** `app/auth/callback/route.ts`

**Change:** Use same `NODE_ENV` logic as OAuth calls

```typescript
// BEFORE (line 51)
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? reconstructedOrigin).replace(/\/$/, '')

// AFTER
const siteUrl = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000'
  : 'https://chat.aidrivenfuture.ca'
```

---

### **FIX 2: Add Cookie Read Delay Handling**

**File:** `app/chat/page.tsx`

**Change:** Add small delay or retry logic for cookie availability

```typescript
// Add after getUser() call
if (!user) {
  // Wait a moment for cookies to be available
  await new Promise(resolve => setTimeout(resolve, 100))
  const retryUser = await getUser()
  if (!retryUser) {
    redirect('/')
  }
}
```

**OR** Better: Ensure callback route waits before redirecting.

---

### **FIX 3: Add Environment Variable Validation**

**File:** `lib/supabase/client.ts` (already has some validation)

**Enhancement:** Add validation helper

```typescript
// Add to lib/supabase/client.ts
export const validateEnvVars = () => {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}
```

---

### **FIX 4: Make Debug Logging Conditional**

**File:** `app/auth/callback/route.ts`

**Change:** Only log in development

```typescript
const isDev = process.env.NODE_ENV === 'development'

if (isDev) {
  console.log('========== CALLBACK DIAGNOSTICS ==========')
  // ... all debug logs
}
```

---

## 📝 FIXED VERSION OF ENTIRE LOGIN CHAIN

### **1. components/LandingPage.tsx** ✅ (Already Correct)

```typescript
const handleSignIn = async () => {
  const redirectTo =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/auth/callback'
      : 'https://chat.aidrivenfuture.ca/auth/callback'

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  })

  if (error) {
    console.error('Error signing in:', error.message)
  }
}
```

---

### **2. components/auth-button.tsx** ✅ (Already Correct)

```typescript
const handleSignIn = async () => {
  console.log('OAuth initiated via Supabase')
  const redirectTo =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/auth/callback'
      : 'https://chat.aidrivenfuture.ca/auth/callback'

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  })

  if (error) {
    console.error('Error signing in:', error.message)
    alert(`Error: ${error.message}`)
  }
}
```

---

### **3. lib/supabase/auth.ts** ✅ (Already Correct)

```typescript
export const signInWithOAuth = async (provider: Provider) => {
  console.log('OAuth initiated via Supabase')
  const redirectTo =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/auth/callback'
      : 'https://chat.aidrivenfuture.ca/auth/callback'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
    },
  })

  if (error) {
    console.error(`Error signing in with ${provider}:`, error.message)
    throw error
  }

  return data
}
```

---

### **4. app/auth/callback/route.ts** ⚠️ (NEEDS FIX)

**FIXED VERSION:**

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const isDev = process.env.NODE_ENV === 'development'
  
  // Use same logic as OAuth calls for consistency
  const siteUrl = isDev
    ? 'http://localhost:3000'
    : 'https://chat.aidrivenfuture.ca'

  if (isDev) {
    console.log('========== CALLBACK DIAGNOSTICS ==========')
    console.log('[Callback] request.url:', request.url)
    console.log('[Callback] host:', request.headers.get('host'))
    console.log('[Callback] x-forwarded-host:', request.headers.get('x-forwarded-host'))
    console.log('[Callback] x-forwarded-proto:', request.headers.get('x-forwarded-proto'))
  }
  
  // Parse URL - handle both direct access and proxied access
  let requestUrl: URL
  try {
    const forwardedHost = request.headers.get('x-forwarded-host')
    if (forwardedHost && request.url.includes('localhost')) {
      const proto = request.headers.get('x-forwarded-proto') ?? 'https'
      const correctedUrl = request.url.replace(/http:\/\/localhost:\d+/, `${proto}://${forwardedHost}`)
      requestUrl = new URL(correctedUrl)
    } else {
      requestUrl = new URL(request.url)
    }
  } catch (e) {
    if (isDev) console.error('[Callback] Failed to parse URL:', e)
    requestUrl = new URL(request.url)
  }
  
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const next = requestUrl.searchParams.get('next') ?? '/chat'

  if (isDev) {
    console.log('[Callback] Code:', code)
    console.log('[Callback] Error:', error)
    console.log('===========================================')
  }

  // Handle OAuth errors
  if (error) {
    console.error('[Callback] OAuth error:', error, errorDescription)
    return NextResponse.redirect(`${siteUrl}/auth/auth-code-error`)
  }

  // Handle authorization code flow
  if (code) {
    if (isDev) console.log('[Callback] Processing authorization code...')
    
    // Create redirect response - cookies will be added to this response
    const redirectUrl = `${siteUrl}${next}`
    let response = NextResponse.redirect(redirectUrl)

    // Create Supabase client for Route Handler that writes cookies to response
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            const cookieOptions = {
              ...options,
              path: '/',
            }
            request.cookies.set({
              name,
              value,
              ...cookieOptions,
            })
            response.cookies.set({
              name,
              value,
              ...cookieOptions,
            })
          },
          remove(name: string, options: any) {
            const cookieOptions = {
              ...options,
              path: '/',
            }
            request.cookies.set({
              name,
              value: '',
              ...cookieOptions,
            })
            response.cookies.set({
              name,
              value: '',
              ...cookieOptions,
            })
          },
        },
      }
    )
    
    // Exchange code for session - this will set cookies via the handlers above
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (isDev) {
      console.log('[Callback] Exchange error:', exchangeError?.message)
      console.log('[Callback] Session exists:', !!data?.session)
      console.log('[Callback] User:', data?.session?.user?.email)
    }
    
    if (exchangeError) {
      console.error('[Callback] Error exchanging code for session:', exchangeError.message)
      return NextResponse.redirect(`${siteUrl}/auth/auth-code-error`)
    }

    if (!data?.session) {
      console.error('[Callback] No session returned after exchange')
      return NextResponse.redirect(`${siteUrl}/auth/auth-code-error`)
    }

    if (isDev) {
      console.log('[Callback] Session exchanged successfully, redirecting to:', redirectUrl)
    }
    
    // Return the redirect response with cookies already set
    return response
  }

  console.error('[Callback] No code or tokens found in request')
  return NextResponse.redirect(`${siteUrl}/auth/auth-code-error`)
}
```

---

### **5. app/chat/page.tsx** ✅ (Already Correct)

```typescript
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'
import ChatWindow from '@/components/ChatWindow'
import ChatInput from '@/components/ChatInput'
import ChatHeader from '@/components/chat-header'

export const dynamic = 'force-dynamic'

export default async function ChatPage() {
  const user = await getUser()

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
```

---

## 🎯 SUMMARY

### **What's Working ✅**
1. All OAuth calls use consistent `NODE_ENV` logic
2. All OAuth calls specify `redirectTo` explicitly
3. Callback route exists and handles code exchange
4. Middleware correctly excludes callback route
5. Server components use dynamic rendering
6. Cookie handling is correct

### **What Needs Fixing ⚠️**
1. **Callback route should use `NODE_ENV` instead of `NEXT_PUBLIC_SITE_URL`**
2. **Debug logging should be conditional (dev only)**
3. **Consider adding cookie read retry in `/chat` page**

### **Critical Action Items**
1. ✅ Apply FIX 1 to `app/auth/callback/route.ts`
2. ✅ Apply FIX 4 to `app/auth/callback/route.ts`
3. ⚠️ Verify Google Cloud Console has both redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://chat.aidrivenfuture.ca/auth/callback`
4. ⚠️ Verify Supabase Dashboard has both redirect URLs configured

---

## 📋 TESTING CHECKLIST

After applying fixes:

- [ ] OAuth from localhost redirects to `http://localhost:3000/auth/callback?code=XXXX`
- [ ] OAuth from production redirects to `https://chat.aidrivenfuture.ca/auth/callback?code=XXXX`
- [ ] Callback route exchanges code successfully
- [ ] Cookies are set (`sb-*-auth-token`)
- [ ] User is redirected to `/chat`
- [ ] `/chat` page detects authenticated user
- [ ] Refresh keeps user authenticated
- [ ] Sign out redirects to `/`
- [ ] No redirect loops occur

---

**END OF AUDIT REPORT**

