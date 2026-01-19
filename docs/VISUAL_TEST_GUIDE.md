# 👀 Visual Test Guide - What You Should See

## 🎯 Expected UI States

This guide shows exactly what you should see in each scenario.

---

## Scenario 1: Visit Site (Not Logged In)

### URL: `http://localhost:3000`

**Redirects to:** `/login`

**What You See:**
```
┌─────────────────────────────────────────┐
│                                         │
│         Welcome Back                    │
│                                         │
│   Sign in to continue to AI Chat Portal │
│                                         │
│   ┌─────────────────────────────────┐  │
│   │  🔵 Continue with Google         │  │
│   └─────────────────────────────────┘  │
│                                         │
│   Used only for identity verification.  │
│   No tracking. No training.             │
│                                         │
│   AUTHORIZED PERSONNEL ONLY             │
└─────────────────────────────────────────┘
```

**✅ Success:** Clean login page with Google button

**❌ Fail:** Shows chat interface or "Sign in with Google" on chat page

---

## Scenario 2: After Clicking "Continue with Google"

### Flow: OAuth → Callback → Chat

**What You See:**
1. Redirect to Google login screen
2. Google consent screen (if first time)
3. Brief "Redirecting..." from Supabase
4. Lands on `/chat`

**Chat Page:**
```
┌──────────────────────────────────────────────────────┐
│ Signed in as patrick.dalpe@gmail.com  🌙  [Logout]   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  [Sidebar]    │   Chat Window                       │
│               │                                      │
│  Conversations│   (Your chat interface here)        │
│               │                                      │
│               │                                      │
│               │                                      │
│               ├──────────────────────────────────────│
│               │  Type a message...              [↑] │
└──────────────────────────────────────────────────────┘
```

**✅ Success Indicators:**
- ✅ Shows: "Signed in as your-email@gmail.com"
- ✅ Shows: Logout button
- ✅ Shows: Chat interface
- ✅ URL is: `/chat`

**❌ Fail Indicators:**
- ❌ Still shows: "Sign in with Google"
- ❌ Still on: `/login`
- ❌ Email not displayed
- ❌ Error page shown

---

## Scenario 3: Refresh Chat Page (F5)

### URL: `http://localhost:3000/chat`

**After Refresh:**
```
┌──────────────────────────────────────────────────────┐
│ Signed in as patrick.dalpe@gmail.com  🌙  [Logout]   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  [Sidebar]    │   Chat Window                       │
│               │                                      │
│               │   (Same chat interface)             │
│               │                                      │
└──────────────────────────────────────────────────────┘
```

**✅ Success:**
- ✅ Stays on `/chat`
- ✅ Email still shown
- ✅ No redirect to login
- ✅ No flash of "not logged in" state

**❌ Fail:**
- ❌ Redirects to `/login`
- ❌ Email disappears
- ❌ Shows login button

---

## Scenario 4: Try to Access /login While Logged In

### URL: `http://localhost:3000/login` (manually typed)

**Redirects to:** `/chat`

**What You See:**
```
(Immediately redirects to /chat - never see login page)

┌──────────────────────────────────────────────────────┐
│ Signed in as patrick.dalpe@gmail.com  🌙  [Logout]   │
├──────────────────────────────────────────────────────┤
│  Chat Interface                                      │
└──────────────────────────────────────────────────────┘
```

**✅ Success:**
- ✅ Instant redirect from `/login` to `/chat`
- ✅ Never see login button
- ✅ Email displayed

**❌ Fail:**
- ❌ Login page shows
- ❌ Google button visible
- ❌ Can access `/login` while logged in

---

## Scenario 5: Click Logout Button

### Action: Click "Logout" in chat header

**What Happens:**
1. Click "Logout"
2. Brief moment (session clearing)
3. Redirect to `/login`

**After Logout:**
```
┌─────────────────────────────────────────┐
│                                         │
│         Welcome Back                    │
│                                         │
│   Sign in to continue to AI Chat Portal │
│                                         │
│   ┌─────────────────────────────────┐  │
│   │  🔵 Continue with Google         │  │
│   └─────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

**✅ Success:**
- ✅ Redirects to `/login`
- ✅ Shows Google button
- ✅ Email NO LONGER visible
- ✅ Cannot access `/chat` anymore

**❌ Fail:**
- ❌ Stays on `/chat`
- ❌ Email still shown
- ❌ Can still access chat

---

## Scenario 6: Try to Access /chat After Logout

### URL: `http://localhost:3000/chat` (manually typed)

**Redirects to:** `/login`

**What You See:**
```
(Immediately redirects - cannot access chat)

┌─────────────────────────────────────────┐
│         Welcome Back                    │
│                                         │
│   ┌─────────────────────────────────┐  │
│   │  🔵 Continue with Google         │  │
│   └─────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**✅ Success:**
- ✅ Cannot access `/chat`
- ✅ Redirects to `/login`
- ✅ Protected route works

**❌ Fail:**
- ❌ Can access `/chat` without login
- ❌ Shows chat interface

---

## Browser DevTools - What You Should See

### Console Tab

**After Successful Login:**
```
[Server Action] OAuth initiated
[Server Action] Origin: http://localhost:3000
[Server Action] Redirecting to Google login
[Callback] Request received
[Callback] Origin: http://localhost:3000
[Callback] Code: <present>
[Callback] Exchanging code for session...
[Callback] Session established for user: patrick.dalpe@gmail.com
```

**✅ Success:** All logs show successful flow

**❌ Fail:** Errors or "Code: null"

---

### Application → Cookies

**When Logged In:**
```
Name                                    Value           Path
─────────────────────────────────────────────────────────────
sb-[project]-auth-token                 [long token]    /
sb-[project]-auth-token-code-verifier   [verifier]      /
```

**✅ Success:**
- ✅ Cookies exist
- ✅ Path is `/`
- ✅ Values are not empty

**❌ Fail:**
- ❌ No cookies
- ❌ Cookies have wrong path
- ❌ Cookies are empty

---

### Console Test

**Run This:**
```javascript
const { data: { user } } = await supabase.auth.getUser()
console.log('User:', user)
console.log('Email:', user?.email)
```

**Expected Output (When Logged In):**
```javascript
User: {
  id: "uuid-here",
  email: "patrick.dalpe@gmail.com",
  user_metadata: { ... },
  ...
}
Email: "patrick.dalpe@gmail.com"
```

**Expected Output (When Logged Out):**
```javascript
User: null
Email: undefined
```

**✅ Success:** Matches login state

**❌ Fail:** Shows user when logged out, or null when logged in

---

## Network Tab - OAuth Flow

**Expected Requests:**

1. **Click "Continue with Google":**
   ```
   POST /auth/callback (server action)
   → Response: 302 Redirect to Google
   ```

2. **Google Login:**
   ```
   GET accounts.google.com/...
   → Google OAuth screens
   ```

3. **Supabase Callback:**
   ```
   GET [project].supabase.co/auth/v1/callback
   → Supabase processes OAuth
   ```

4. **Your App Callback:**
   ```
   GET /auth/callback?code=XXXXX
   → Sets cookies, redirects to /chat
   ```

5. **Chat Page Load:**
   ```
   GET /chat
   → Status: 200 OK
   → Shows chat interface
   ```

**✅ Success:** Clean flow, no errors

**❌ Fail:** 
- redirect_uri_mismatch
- No code parameter
- 401 Unauthorized

---

## 🎯 Quick Visual Checklist

Use this during testing:

### Login Flow
- [ ] `/login` shows Google button
- [ ] Button says "Continue with Google"
- [ ] Privacy notice visible
- [ ] No email shown (not logged in)

### After Login
- [ ] Lands on `/chat` URL
- [ ] Shows: "Signed in as your-email@gmail.com"
- [ ] Logout button visible
- [ ] Chat interface visible
- [ ] NO "Sign in with Google" button

### Refresh Test
- [ ] F5 on `/chat` stays on `/chat`
- [ ] Email still shown
- [ ] No redirect

### Logout Test
- [ ] Click Logout → redirects to `/login`
- [ ] Google button visible again
- [ ] Email gone
- [ ] Cannot access `/chat`

---

## 🔍 Common Visual Issues

### Issue: See This
```
┌──────────────────────────────────────┐
│ 🔵 Continue with Google               │  ← On /chat page
├──────────────────────────────────────┤
│ Chat Interface                       │
└──────────────────────────────────────┘
```

**Problem:** Login button on chat page (should show email instead)

**Fix:** Check `lib/supabase/client.ts` uses `createBrowserClient`

---

### Issue: See This After Refresh
```
Redirecting to /login... (when you were on /chat)
```

**Problem:** Session not persisting

**Fix:** Check cookies exist and have `Path=/`

---

### Issue: See This
```
┌──────────────────────────────────────┐
│ Signed in as patrick.dalpe@gmail.com  │ ← On /login page
│                                      │
│ 🔵 Continue with Google               │
└──────────────────────────────────────┘
```

**Problem:** Login page accessible when logged in

**Fix:** Check `/login` page redirects authenticated users

---

## ✅ Perfect State Indicators

When everything works correctly:

1. **Landing (not logged in):**
   - URL: `/login`
   - Shows: Google button
   - No email visible

2. **After Login:**
   - URL: `/chat`
   - Shows: "Signed in as email"
   - Has: Logout button
   - No login button

3. **After Refresh:**
   - Still: `/chat`
   - Still: Shows email
   - Still: Logged in

4. **After Logout:**
   - URL: `/login`
   - Shows: Google button
   - No email visible
   - Can't access `/chat`

---

**If all visual checks pass, authentication is perfect!** ✅

**Next:** Run tests in `TESTING_CHECKLIST.md` for detailed validation.

