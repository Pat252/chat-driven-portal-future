# OAuth Server Actions Guide

## ✅ Complete OAuth Refactor

This project now uses **Next.js Server Actions** for OAuth authentication instead of client-side calls. This provides better security, proper PKCE flow support, and reliable cookie handling.

---

## 🏗️ Architecture

### Flow Diagram

```
1. User clicks "Sign in with Google" button
   ↓
2. Form submits to signInWithGoogleAction() (Server Action)
   ↓
3. Server Action:
   - Detects origin (localhost or production)
   - Creates Supabase server client
   - Calls supabase.auth.signInWithOAuth()
   - Gets Google OAuth URL
   ↓
4. Redirects user to Google login
   ↓
5. Google redirects to: https://[supabase-project].supabase.co/auth/v1/callback
   ↓
6. Supabase redirects to: [your-app]/auth/callback?code=XXXXX
   ↓
7. Callback Route Handler:
   - Extracts code from query params
   - Calls exchangeCodeForSession(code)
   - Sets HTTP-only cookies
   - Redirects to /chat
   ↓
8. User is authenticated ✅
```

---

## 📁 Key Files

### 1. **app/auth/actions.ts** - Server Actions

Contains:
- `signInWithGoogleAction()` - Initiates Google OAuth
- `signOutAction()` - Signs out user

**Why Server Actions?**
- Runs on the server (secure)
- Proper origin detection (works with Cloudflare Tunnel)
- No client-side environment variables needed
- Better cookie handling

```typescript
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signInWithGoogleAction() {
  // Detects origin from request headers
  const origin = detectOrigin()
  
  const supabase = createServerClient()
  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })
  
  redirect(data.url) // Google login page
}
```

### 2. **components/AuthButton.tsx** - Client Component

Uses a `<form>` to call the server action:

```tsx
<form action={signInWithGoogleAction}>
  <button type="submit">
    Sign in with Google
  </button>
</form>
```

**NOT:**
```tsx
// ❌ OLD WAY (client-side, deprecated)
<button onClick={() => supabase.auth.signInWithOAuth(...)}>
```

### 3. **app/auth/callback/route.ts** - OAuth Callback

Handles the OAuth callback from Supabase:

```typescript
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  
  const supabase = createServerClient()
  await supabase.auth.exchangeCodeForSession(code)
  
  // Cookies are automatically set
  return NextResponse.redirect(`${origin}/chat`)
}
```

### 4. **middleware.ts** - Session Refresh

Refreshes Supabase session on every request (except auth routes):

```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|...).*)',
  ],
}
```

**CRITICAL:** Must exclude `/auth/callback` to prevent intercepting the OAuth flow.

---

## 🌐 Environment Support

### Localhost
- Origin: `http://localhost:3000`
- Callback: `http://localhost:3000/auth/callback`

### Production
- Origin: `https://chat.aidrivenfuture.ca`
- Callback: `https://chat.aidrivenfuture.ca/auth/callback`

### Cloudflare Tunnel
- Detects origin from `x-forwarded-host` and `x-forwarded-proto` headers
- Works seamlessly without hardcoded URLs

---

## 🧪 Testing

### 1. Test Localhost

```bash
npm run dev
```

1. Go to `http://localhost:3000`
2. Click "Continue with Google"
3. Should redirect to Google login
4. After login, should redirect to `/chat`
5. Check terminal logs:
   ```
   [Server Action] OAuth initiated
   [Server Action] Origin: http://localhost:3000
   [Callback] Code: <present>
   [Callback] Session established for user: your-email@gmail.com
   ```

### 2. Test Production

1. Deploy to production
2. Visit `https://chat.aidrivenfuture.ca`
3. Same flow should work
4. Check logs for correct origin

### 3. Verify Session

After login, in browser console:

```javascript
const { data: { user } } = await supabase.auth.getUser()
console.log(user)
```

Should show authenticated user.

---

## 🔍 Debugging

### Issue: No code in callback

**Symptom:** `/auth/callback` receives no `code` parameter

**Solution:**
1. Verify Google Cloud OAuth redirect URIs include your callback URL
2. Check Supabase dashboard → Authentication → URL Configuration
3. Ensure `signInWithGoogleAction()` uses correct `redirectTo`

### Issue: redirect_uri_mismatch

**Symptom:** Google shows "redirect_uri_mismatch" error

**Solution:**
1. Add callback URL to Google Cloud Console → OAuth 2.0 Client IDs
2. Must match exactly: `http://localhost:3000/auth/callback` or `https://chat.aidrivenfuture.ca/auth/callback`

### Issue: Cookies not set

**Symptom:** Session exists in callback but not on subsequent requests

**Solution:**
1. Ensure `createServerClient()` uses `@supabase/ssr`
2. Check middleware is not blocking requests
3. Verify cookies have `path=/` (automatic with `@supabase/ssr`)

### Issue: Redirect loops

**Symptom:** Page keeps redirecting between `/` and `/chat`

**Solution:**
1. Add `export const dynamic = 'force-dynamic'` to page components
2. Verify `getUser()` is working correctly
3. Check server logs for session detection

---

## 🚫 What NOT to Do

### ❌ Client-side OAuth calls

```typescript
// DON'T DO THIS
const { data } = await supabase.auth.signInWithOAuth({
  provider: 'google',
})
```

**Why?** Client-side OAuth can cause:
- PKCE flow issues
- Cookie propagation problems
- Environment variable exposure
- Inconsistent origin detection

### ✅ Use Server Actions instead

```typescript
// DO THIS
import { signInWithGoogleAction } from '@/app/auth/actions'

<form action={signInWithGoogleAction}>
  <button type="submit">Sign in</button>
</form>
```

---

## 📝 Migration Checklist

If migrating from client-side OAuth:

- [x] Create `app/auth/actions.ts` with server actions
- [x] Update all components to use server actions
- [x] Remove `signInWithOAuth` calls from client components
- [x] Update callback route to use `exchangeCodeForSession`
- [x] Update middleware to exclude `/auth/callback`
- [x] Remove hardcoded URLs from all files
- [x] Test on localhost
- [x] Test on production
- [x] Test with Cloudflare Tunnel

---

## 🎯 Summary

| Aspect | Old (Client-side) | New (Server Actions) |
|--------|------------------|---------------------|
| **OAuth Call** | Client component | Server action |
| **Origin Detection** | `window.location` | Request headers |
| **Cookie Handling** | Manual | Automatic (SSR) |
| **PKCE Flow** | Inconsistent | Proper |
| **Security** | Less secure | More secure |
| **Cloudflare Support** | Problematic | Works perfectly |

---

**Result:** Robust, production-ready OAuth flow that works everywhere! 🚀

