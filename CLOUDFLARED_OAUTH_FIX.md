# Cloudflared OAuth Callback Fix

## Problem
OAuth callback not receiving `?code=` parameter when accessed via Cloudflared tunnel (`chat.aidrivenfuture.ca`) → localhost:3000

## Root Cause
When Cloudflared proxies requests to localhost, the `request.url` in Next.js contains `http://localhost:3000` but the actual public URL is `https://chat.aidrivenfuture.ca`. This causes URL parsing issues and prevents the callback from reading the `code` parameter correctly.

---

## Solution Applied

### PART 1: Comprehensive Header Logging

Added extensive logging to diagnose Cloudflared forwarding:

```typescript
console.log('[Callback] request.url:', request.url)
console.log('[Callback] host:', request.headers.get('host'))
console.log('[Callback] x-forwarded-host:', request.headers.get('x-forwarded-host'))
console.log('[Callback] x-forwarded-proto:', request.headers.get('x-forwarded-proto'))
console.log('[Callback] x-forwarded-for:', request.headers.get('x-forwarded-for'))
```

### PART 2: Origin Reconstruction from Forwarded Headers

```typescript
const forwardedHost = request.headers.get('x-forwarded-host')
const forwardedProto = request.headers.get('x-forwarded-proto')
const host = forwardedHost ?? request.headers.get('host') ?? 'localhost:3000'
const proto = forwardedProto ?? (host.includes('localhost') ? 'http' : 'https')
const reconstructedOrigin = `${proto}://${host}`
```

**How it works:**
- Checks for `x-forwarded-host` header (set by Cloudflared)
- Checks for `x-forwarded-proto` header (should be `https`)
- Reconstructs the origin as `https://chat.aidrivenfuture.ca`

### PART 3: URL Correction for Proxied Requests

```typescript
if (forwardedHost && request.url.includes('localhost')) {
  const correctedUrl = request.url.replace(/http:\/\/localhost:\d+/, reconstructedOrigin)
  console.log('[Callback] Corrected URL:', correctedUrl)
  requestUrl = new URL(correctedUrl)
} else {
  requestUrl = new URL(request.url)
}
```

**What this does:**
- If `x-forwarded-host` exists AND URL contains `localhost`
- Replaces `http://localhost:3000` with `https://chat.aidrivenfuture.ca`
- Preserves the path and query parameters (including `?code=...`)

### PART 4: Validated Cookie Writing

Confirmed that cookies are written via custom handlers:

```typescript
response.cookies.set({
  name,
  value,
  ...cookieOptions,
  path: '/',
})
```

All cookies use `path: '/'` to ensure they're available site-wide.

---

## Expected Cloudflared Configuration

Your `~/.cloudflared/config.yml` should contain:

```yaml
tunnel: <your-tunnel-id>
credentials-file: /path/to/credentials.json

ingress:
  - hostname: chat.aidrivenfuture.ca
    service: http://localhost:3000
  - service: http_status:404
```

**Cloudflared automatically adds these headers:**
- `x-forwarded-host: chat.aidrivenfuture.ca`
- `x-forwarded-proto: https`
- `x-forwarded-for: <client-ip>`

---

## Expected Terminal Output

### Successful OAuth Flow:

```
========== CALLBACK DIAGNOSTICS ==========
[Callback] request.url: http://localhost:3000/auth/callback?code=abc123...
[Callback] host: localhost:3000
[Callback] x-forwarded-host: chat.aidrivenfuture.ca
[Callback] x-forwarded-proto: https
[Callback] x-forwarded-for: 1.2.3.4
[Callback] Reconstructed origin: https://chat.aidrivenfuture.ca
[Callback] Corrected URL: https://chat.aidrivenfuture.ca/auth/callback?code=abc123...
[Callback] Parsed URL: https://chat.aidrivenfuture.ca/auth/callback?code=abc123...
[Callback] Search params: code=abc123...
[Callback] Hash: 
[Callback] Site URL: https://chat.aidrivenfuture.ca
[Callback] Code: abc123...
[Callback] Error: null
===========================================
[Callback] Processing authorization code...
[Callback] Exchange error: null
[Callback] Session exists: true
[Callback] User: user@example.com
[Callback] Session exchanged successfully, redirecting to: https://chat.aidrivenfuture.ca/chat
```

### Failed OAuth Flow (No Code):

```
========== CALLBACK DIAGNOSTICS ==========
[Callback] request.url: http://localhost:3000/auth/callback
[Callback] host: localhost:3000
[Callback] x-forwarded-host: chat.aidrivenfuture.ca
[Callback] x-forwarded-proto: https
[Callback] x-forwarded-for: 1.2.3.4
[Callback] Reconstructed origin: https://chat.aidrivenfuture.ca
[Callback] Corrected URL: https://chat.aidrivenfuture.ca/auth/callback
[Callback] Parsed URL: https://chat.aidrivenfuture.ca/auth/callback
[Callback] Search params: 
[Callback] Hash: 
[Callback] Site URL: https://chat.aidrivenfuture.ca
[Callback] Code: null
[Callback] Error: null
===========================================
[Callback] No code or tokens found in request
```

**If you see this:** Check Supabase redirect URL configuration in dashboard.

---

## Troubleshooting

### Issue: `x-forwarded-host` is `null`

**Cause:** Cloudflared not configured correctly

**Fix:**
1. Check Cloudflared is running: `cloudflared tunnel list`
2. Check tunnel config: `cat ~/.cloudflared/config.yml`
3. Restart tunnel: `cloudflared tunnel run <tunnel-name>`

### Issue: `Code: null` but URL looks correct

**Cause:** Supabase redirecting to wrong URL

**Fix:**
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add redirect URL: `https://chat.aidrivenfuture.ca/auth/callback`
3. Ensure Site URL is set to: `https://chat.aidrivenfuture.ca`

### Issue: Cookies not appearing

**Cause:** Cookie domain mismatch

**Fix:**
1. Ensure `NEXT_PUBLIC_SITE_URL=https://chat.aidrivenfuture.ca`
2. Check browser cookies for domain `chat.aidrivenfuture.ca`
3. Verify cookies have `Path=/`

### Issue: "Auth session missing" error

**Cause:** `exchangeCodeForSession()` failing

**Fix:**
1. Check logs for `[Callback] Exchange error:`
2. Verify code is valid (not expired)
3. Check Supabase Auth logs in dashboard

---

## Testing Checklist

- [ ] Start Cloudflared tunnel
- [ ] Restart Next.js dev server
- [ ] Open browser to `https://chat.aidrivenfuture.ca`
- [ ] Click "Continue with Google"
- [ ] Complete OAuth consent
- [ ] Check terminal for callback logs
- [ ] Verify `x-forwarded-host: chat.aidrivenfuture.ca`
- [ ] Verify `Code: abc123...` (not null)
- [ ] Verify redirect to `/chat`
- [ ] Check browser cookies for `sb-*-auth-token`
- [ ] Refresh page → still authenticated

---

## Files Modified

1. **`app/auth/callback/route.ts`**
   - Added Cloudflared header logging
   - Added origin reconstruction from forwarded headers
   - Added URL correction for proxied requests
   - Enhanced debug logging throughout

---

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=https://fkkwzdampnfaysqjoeav.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=https://chat.aidrivenfuture.ca
```

---

## Next Steps

1. **Test the flow** - Follow testing checklist above
2. **Share logs** - If issues persist, share the terminal output
3. **Verify Supabase config** - Ensure redirect URLs match
4. **Check Cloudflared** - Confirm headers are being forwarded

---

**Status:** ✅ Ready for testing with Cloudflared tunnel

