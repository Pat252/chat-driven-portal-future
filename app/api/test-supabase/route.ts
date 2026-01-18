/**
 * Test Supabase Connection API Route
 * 
 * Visit /api/test-supabase to verify your Supabase connection
 * This endpoint checks:
 * - Environment variables are set
 * - Connection to Supabase is working
 * - Authentication system is accessible
 */

import { getConnectionStatus } from '@/lib/supabase/verify'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const status = await getConnectionStatus()
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      ...status,
    }, {
      status: status.connected ? 200 : 500,
    })
  } catch (error: any) {
    return NextResponse.json({
      connected: false,
      error: error.message || 'Unknown error',
      timestamp: new Date().toISOString(),
    }, {
      status: 500,
    })
  }
}




