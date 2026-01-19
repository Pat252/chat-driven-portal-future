# OAuth Testing Guide

## 🧪 How to Test the New OAuth Flow

After implementing the server action-based OAuth flow, follow these steps to verify everything works correctly.

---

## ✅ Pre-Testing Checklist

### 1. Verify Google Cloud Console Configuration

Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials

Your OAuth 2.0 Client ID should have these **Authorized redirect URIs**:

```
http://localhost:3000/auth/callback
https://chat.aidrivenfuture.ca/auth/callback
https://drzvcaqylfjfebesdxjz.supabase.co/auth/v1/callback
```

### 2. Verify Supabase Dashboard Configuration

Go to Supabase Dashboard → Authentication → URL Configuration

- **Site URL**: `https://chat.aidrivenfuture.ca` (or your production URL)
- **Redirect URLs**: Add both:
  - `http://localhost:3000/auth/callback`
  - `https://chat.aidrivenfuture.ca/auth/callback`

### 3. Verify Environment Variables

Check `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://drzvcaqylfjfebesdxjz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🧪 Test 1: Localhost OAuth Flow

### Step 1: Start the Dev Server

```bash
npm run dev
```

### Step 2: Open Browser

Navigate to:
```
http://localhost:3000
```

### Step 3: Click "Continue with Google"

You should see:
1. Loading state briefly
2. Redirect to Google login page
3. Google OAuth consent screen

### Step 4: Complete Google Login

After authenticating with Google:
1. Redirects to Supabase: `https://[project].supabase.co/auth/v1/callback`
2. Supabase redirects to: `http://localhost:3000/auth/callback?code=XXXXX`
3. Finally redirects to: `http://localhost:3000/chat`

### Step 5: Verify Terminal Logs

Your terminal should show:

```
[Server Action] OAuth initiated
[Server Action] Origin: http://localhost:3000
[Server Action] Callback URL: http://localhost:3000/auth/callback
[Server Action] Redirecting to Google login
[Callback] Request received
[Callback] Origin: http://localhost:3000
[Callback] Code: <present>
[Callback] Exchanging code for session...
[Callback] Session established for user: your-email@gmail.com
```

### Step 6: Verify Browser State

Open browser DevTools → Console:

```javascript
// Check authentication
const { data: { user } } = await supabase.auth.getUser()
console.log(user)
```

Should display your user object with email, id, etc.

### Step 7: Check Cookies

DevTools → Application → Cookies → `http://localhost:3000`

Should see cookies like:
- `sb-[project-ref]-auth-token`
- `sb-[project-ref]-auth-token-code-verifier` (temporary, may expire)

---

## 🧪 Test 2: Production OAuth Flow

### Step 1: Deploy to Production

```bash
git add .
git commit -m "Implement server action OAuth flow"
git push origin main
```

### Step 2: Visit Production URL

Navigate to:
```
https://chat.aidrivenfuture.ca
```

### Step 3: Test Same Flow

Same steps as localhost test, but:
- Callback URL should be: `https://chat.aidrivenfuture.ca/auth/callback`
- Cookies should be on `chat.aidrivenfuture.ca` domain
- HTTPS secure cookies

### Step 4: Check Production Logs

If using Vercel:
1. Go to Vercel Dashboard → Your Project → Functions
2. Find `/auth/callback` function
3. Check logs for:
   ```
   [Callback] Origin: https://chat.aidrivenfuture.ca
   [Callback] Code: <present>
   [Callback] Session established
   ```

---

## 🧪 Test 3: Cloudflare Tunnel

### Step 1: Start Cloudflare Tunnel

```bash
cloudflared tunnel --url http://localhost:3000
```

Note the generated URL, e.g., `https://abc123.trycloudflare.com`

### Step 2: Add to Google Cloud Console

Temporarily add to Authorized redirect URIs:
```
https://abc123.trycloudflare.com/auth/callback
```

### Step 3: Add to Supabase Dashboard

Temporarily add to Redirect URLs:
```
https://abc123.trycloudflare.com/auth/callback
```

### Step 4: Test OAuth Flow

Visit the Cloudflare URL and test login.

Terminal should show:
```
[Server Action] Origin: https://abc123.trycloudflare.com
```

---

## 🚨 Troubleshooting

### Issue 1: `redirect_uri_mismatch`

**Error:** Google shows "Error 400: redirect_uri_mismatch"

**Solution:**
1. Check the URL Google is trying to redirect to (shown in error)
2. Add that exact URL to Google Cloud Console → Authorized redirect URIs
3. Common issue: Missing trailing slash or wrong protocol (http vs https)

### Issue 2: No Code in Callback

**Symptom:** Terminal shows `[Callback] Code: null`

**Solution:**
1. Check Google Cloud Console redirect URIs include your callback URL
2. Verify Supabase redirects are configured
3. Check if error parameter exists: `?error=access_denied`

### Issue 3: Session Not Persisting

**Symptom:** Login works but redirect to `/chat` shows "not authenticated"

**Solution:**
1. Verify `createServerClient()` is using `@supabase/ssr`
2. Check cookies are being set (DevTools → Application → Cookies)
3. Ensure `middleware.ts` is not blocking `/chat` route
4. Add `export const dynamic = 'force-dynamic'` to `/chat/page.tsx`

### Issue 4: Redirect Loop

**Symptom:** Page keeps redirecting between `/` and `/chat`

**Solution:**
1. Check server logs for user detection
2. Verify `getUser()` is returning correct value
3. Ensure both pages have `export const dynamic = 'force-dynamic'`
4. Clear cookies and try again

### Issue 5: CORS Errors

**Symptom:** Browser console shows CORS errors

**Solution:**
1. Verify Supabase URL Configuration includes your domain
2. Check that you're using HTTPS in production
3. Ensure Supabase project is not paused

---

## 🎯 Success Criteria

Your OAuth flow is working correctly if:

- ✅ No `redirect_uri_mismatch` errors
- ✅ Callback receives `?code=XXXXX` parameter
- ✅ Terminal logs show session established
- ✅ User redirects to `/chat` after login
- ✅ User info appears in chat header
- ✅ Browser cookies are set
- ✅ `supabase.auth.getUser()` returns user object
- ✅ Session persists after page refresh
- ✅ Works on localhost, production, and Cloudflare Tunnel

---

## 🔍 Debug Commands

### Check Current User (Browser Console)

```javascript
const { data: { user }, error } = await supabase.auth.getUser()
console.log({ user, error })
```

### Check Session (Browser Console)

```javascript
const { data: { session }, error } = await supabase.auth.getSession()
console.log({ session, error })
```

### Manual Sign Out (Browser Console)

```javascript
await supabase.auth.signOut()
```

### Clear All Cookies (Browser)

DevTools → Application → Cookies → Clear All

---

## 📊 Expected Flow Timeline

| Step | Action | Expected Result | Time |
|------|--------|----------------|------|
| 1 | Click "Continue with Google" | Button shows loading | <100ms |
| 2 | Server action executes | Redirect to Google | ~200ms |
| 3 | Google OAuth screen | User sees consent screen | ~1s |
| 4 | User clicks "Allow" | Redirect to Supabase | ~500ms |
| 5 | Supabase processes | Redirect to your app | ~200ms |
| 6 | Callback route executes | Exchange code for session | ~300ms |
| 7 | Final redirect | User sees /chat page | ~100ms |

**Total time:** ~2-3 seconds (after user clicks "Allow")

---

## 📝 Test Checklist

Use this checklist to verify all scenarios:

- [ ] Localhost OAuth works
- [ ] Production OAuth works
- [ ] Cloudflare Tunnel OAuth works
- [ ] Session persists after refresh
- [ ] Sign out works correctly
- [ ] Cookies are set correctly
- [ ] Terminal logs show correct flow
- [ ] No redirect loops
- [ ] No CORS errors
- [ ] User info displays in header
- [ ] Auth state updates in real-time (onAuthStateChange)

---

## 🚀 Next Steps

After all tests pass:

1. Remove Cloudflare tunnel URL from Google/Supabase config (if added temporarily)
2. Document any environment-specific quirks
3. Set up monitoring for auth failures
4. Consider adding error tracking (Sentry, etc.)
5. Test on different browsers (Chrome, Firefox, Safari, Edge)
6. Test on mobile devices

---

**Questions?** Check `docs/OAUTH_SERVER_ACTIONS_GUIDE.md` for architecture details.

