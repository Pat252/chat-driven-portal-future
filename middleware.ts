/**
 * Next.js Middleware
 * 
 * This middleware refreshes the Supabase session on every request.
 * This ensures Server Components have access to the latest auth state.
 * 
 * CRITICAL: Does NOT intercept /auth/callback or other auth routes,
 * as this would break the OAuth flow.
 */

import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/callback (OAuth callback - MUST NOT be intercepted)
     * - auth/auth-code-error (Error page)
     * - auth/reset-password (Password reset page)
     * - Images and other static assets
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|auth/auth-code-error|auth/reset-password|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
