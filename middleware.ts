/**
 * Next.js Middleware
 * 
 * This middleware refreshes the Supabase session on every request.
 * This is required for Server Components to have access to the latest auth state.
 */

import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next (Next.js internals)
     * - auth/callback (OAuth callback must NOT be intercepted by middleware)
     * - api/auth (Auth API routes)
     * - favicon.ico, images, icons (static files)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next|auth/callback|api/auth|favicon.ico|images|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

