# Authentication Testing Checklist

## ✅ Complete Testing Guide

Use this checklist to verify the authentication fixes are working correctly.

---

## 🧪 Pre-Test Setup

### 1. Start Development Server

```bash
npm run dev
```

Wait for: `✓ Ready in XXXms`

### 2. Open Browser DevTools

- Press F12 or right-click → Inspect
- Keep Console tab open for logs
- Keep Application → Cookies visible

---

## 📋 Test Cases

### ✅ Test 1: Clean State Login Flow

**Purpose:** Verify new user login experience

**Steps:**
1. Clear all browser cookies
   - DevTools → Application → Cookies → Select `localhost:3000` → Clear all
2. Visit `http://localhost:3000`
3. Verify redirect to `/login`
4. Verify Google Sign-in button is visible
5. Click "Continue with Google"
6. Complete Google OAuth (if prompted)
7. Verify redirect to `/chat`
8. Verify chat header shows: "Signed in as your-email@gmail.com"
9. Verify Logout button is visible

**Expected Results:**
- ✅ Smooth redirect from `/` → `/login`
- ✅ Google button visible and clickable
- ✅ OAuth completes successfully
- ✅ Lands on `/chat` after login
- ✅ User email displayed correctly
- ✅ No "Sign in with Google" button on chat page

**Actual Results:**
- [ ] Pass
- [ ] Fail (describe issue): ___________________

---

### ✅ Test 2: Page Refresh Persistence

**Purpose:** Verify session persists across refreshes

**Prerequisites:** Completed Test 1 (logged in)

**Steps:**
1. Ensure you're on `/chat` and logged in
2. Note your email shown in header
3. Press F5 or Ctrl+R to refresh
4. Wait for page to reload
5. Verify still on `/chat`
6. Verify email still displayed
7. Verify NO redirect to login

**Expected Results:**
- ✅ Page refreshes successfully
- ✅ Still on `/chat` URL
- ✅ User email still visible
- ✅ No flash of "not logged in" state
- ✅ No redirect to login page

**Actual Results:**
- [ ] Pass
- [ ] Fail (describe issue): ___________________

---

### ✅ Test 3: Direct URL Access When Authenticated

**Purpose:** Verify login page redirects when already logged in

**Prerequisites:** Logged in from previous tests

**Steps:**
1. Ensure you're logged in
2. Manually navigate to `http://localhost:3000/login`
3. Verify immediate redirect to `/chat`
4. Verify NO login button shown
5. Verify email displayed in header

**Expected Results:**
- ✅ Immediately redirects from `/login` to `/chat`
- ✅ No Google button visible at any point
- ✅ User email displayed

**Actual Results:**
- [ ] Pass
- [ ] Fail (describe issue): ___________________

---

### ✅ Test 4: Root URL Redirect

**Purpose:** Verify `/` redirects correctly based on auth state

**Prerequisites:** Logged in from previous tests

**Steps:**
1. Visit `http://localhost:3000/`
2. Verify redirect to `/chat`
3. Verify email displayed

**Expected Results:**
- ✅ Redirects from `/` to `/chat`
- ✅ User email visible

**Actual Results:**
- [ ] Pass
- [ ] Fail (describe issue): ___________________

---

### ✅ Test 5: Logout Flow

**Purpose:** Verify logout clears session and redirects

**Prerequisites:** Logged in from previous tests

**Steps:**
1. On `/chat` page, locate "Logout" button
2. Click "Logout" button
3. Verify redirect to `/login`
4. Verify Google Sign-in button is now visible
5. Verify user email is NO LONGER displayed anywhere
6. Try to visit `/chat` directly
7. Verify redirect back to `/login`

**Expected Results:**
- ✅ Logout button works
- ✅ Redirects to `/login` after logout
- ✅ Login button visible again
- ✅ Email no longer displayed
- ✅ Cannot access `/chat` without re-login

**Actual Results:**
- [ ] Pass
- [ ] Fail (describe issue): ___________________

---

### ✅ Test 6: Cookie Verification

**Purpose:** Verify cookies are set correctly

**Prerequisites:** Logged in

**Steps:**
1. Open DevTools → Application → Cookies → `localhost:3000`
2. Look for cookies starting with `sb-` (Supabase cookies)
3. Verify cookies have:
   - ✅ Value (not empty)
   - ✅ Path: `/`
   - ✅ HttpOnly: Yes (if applicable)
4. In Console, run:
   ```javascript
   const { data: { user } } = await supabase.auth.getUser()
   console.log('User:', user)
   ```
5. Verify user object is returned with email

**Expected Results:**
- ✅ Supabase cookies exist
- ✅ Cookies have correct path (`/`)
- ✅ `getUser()` returns user object
- ✅ User email matches what's shown in UI

**Actual Results:**
- [ ] Pass
- [ ] Fail (describe issue): ___________________

---

### ✅ Test 7: Protected Route Access

**Purpose:** Verify `/chat` is protected

**Prerequisites:** Logged out (from Test 5)

**Steps:**
1. Ensure you're logged out
2. Clear cookies if needed
3. Try to visit `http://localhost:3000/chat` directly
4. Verify redirect to `/login`
5. Verify Google button visible
6. Verify chat interface NOT visible

**Expected Results:**
- ✅ Cannot access `/chat` when logged out
- ✅ Redirects to `/login`
- ✅ Login button visible

**Actual Results:**
- [ ] Pass
- [ ] Fail (describe issue): ___________________

---

### ✅ Test 8: Multiple Tab Sync

**Purpose:** Verify session syncs across browser tabs

**Prerequisites:** Logged in

**Steps:**
1. Ensure logged in on Tab 1 (`/chat`)
2. Open new tab (Tab 2)
3. Visit `http://localhost:3000` in Tab 2
4. Verify Tab 2 shows `/chat` with email
5. On Tab 2, click Logout
6. Switch back to Tab 1
7. Try to interact with Tab 1
8. Verify Tab 1 is also logged out (or redirects on next navigation)

**Expected Results:**
- ✅ Tab 2 shows logged in state
- ✅ Logout on Tab 2 works
- ✅ Tab 1 reflects logout (eventually)

**Actual Results:**
- [ ] Pass
- [ ] Fail (describe issue): ___________________

---

### ✅ Test 9: OAuth Callback Verification

**Purpose:** Verify OAuth callback receives code parameter

**Prerequisites:** Logged out

**Steps:**
1. Open DevTools → Network tab
2. Clear network log
3. On `/login`, click "Continue with Google"
4. Complete OAuth (or cancel)
5. After redirect back, check Network tab
6. Find request to `/auth/callback`
7. Verify URL has `?code=XXXXX` parameter
8. Check Console for:
   ```
   [Callback] Code: <present>
   [Callback] Session established
   ```

**Expected Results:**
- ✅ Callback URL has `code` parameter
- ✅ Console shows successful code exchange
- ✅ Session established

**Actual Results:**
- [ ] Pass
- [ ] Fail (describe issue): ___________________

---

### ✅ Test 10: Production Environment (Optional)

**Purpose:** Verify works in production

**Prerequisites:** Deployed to production

**Steps:**
1. Visit production URL (e.g., `https://chat.aidrivenfuture.ca`)
2. Repeat Tests 1-7 on production
3. Verify HTTPS cookies
4. Verify OAuth redirect URLs match production

**Expected Results:**
- ✅ All tests pass on production
- ✅ Cookies have Secure flag (HTTPS)
- ✅ OAuth redirects work

**Actual Results:**
- [ ] Pass
- [ ] Fail (describe issue): ___________________

---

## 🔍 Debugging Failed Tests

### Issue: "Sign in with Google" still shows when logged in

**Possible Causes:**
1. Browser client not using `createBrowserClient`
2. Cookies not syncing
3. Session not persisting

**Debug Steps:**
1. Check `lib/supabase/client.ts` uses `createBrowserClient`
2. Verify cookies exist in DevTools
3. Run in console: `await supabase.auth.getUser()`
4. Check if user is returned

### Issue: Redirect loop between `/` and `/login`

**Possible Causes:**
1. `getUser()` not working on server
2. Cookies not readable server-side
3. Middleware blocking requests

**Debug Steps:**
1. Check server logs for user detection
2. Verify `export const dynamic = 'force-dynamic'` on pages
3. Check middleware exclusions

### Issue: Session lost on refresh

**Possible Causes:**
1. Cookies not persisting
2. Cookie path incorrect
3. Middleware clearing session

**Debug Steps:**
1. Check cookies have `Path=/`
2. Verify middleware uses `@supabase/ssr`
3. Check for cookie clearing code

### Issue: Logout doesn't work

**Possible Causes:**
1. `signOut()` failing
2. Redirect not happening
3. Cookies not clearing

**Debug Steps:**
1. Check console for errors during logout
2. Verify `router.push('/login')` executes
3. Check cookies are removed after logout

---

## ✅ Success Criteria

All tests must pass for authentication to be considered working:

- [x] Clean state login works
- [x] Page refresh keeps user logged in
- [x] Login page redirects when authenticated
- [x] Root URL redirects correctly
- [x] Logout clears session
- [x] Cookies are set properly
- [x] Protected routes are protected
- [x] Multi-tab sync works (eventually)
- [x] OAuth callback receives code
- [x] Production works (if deployed)

**Overall Status:**
- [ ] ✅ All tests passed - Ready for database setup
- [ ] ❌ Some tests failed - Review debugging section

---

## 📊 Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| 1. Clean State Login | [ ] Pass / [ ] Fail | |
| 2. Page Refresh | [ ] Pass / [ ] Fail | |
| 3. Direct URL Access | [ ] Pass / [ ] Fail | |
| 4. Root URL Redirect | [ ] Pass / [ ] Fail | |
| 5. Logout Flow | [ ] Pass / [ ] Fail | |
| 6. Cookie Verification | [ ] Pass / [ ] Fail | |
| 7. Protected Route | [ ] Pass / [ ] Fail | |
| 8. Multi-tab Sync | [ ] Pass / [ ] Fail | |
| 9. OAuth Callback | [ ] Pass / [ ] Fail | |
| 10. Production | [ ] Pass / [ ] Fail | |

---

**Tested By:** ___________________
**Date:** ___________________
**Environment:** Development / Production
**Notes:** ___________________

---

## 🎯 Next Steps After Testing

If all tests pass:
1. Review `DATABASE_SETUP.md`
2. Create messaging tables in Supabase
3. Implement RLS policies
4. Start building messaging features

If tests fail:
1. Review debugging section
2. Check relevant code files
3. Verify environment variables
4. Re-test after fixes

