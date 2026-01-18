/**
 * OAuth Debug Helper
 * 
 * Use this to verify your OAuth configuration.
 * Run this in the browser console to check your setup.
 */

export const debugOAuthConfig = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const expectedSupabaseCallback = `${supabaseUrl}/auth/v1/callback`
  const appCallback = `${window.location.origin}/auth/callback`

  console.log('🔍 OAuth Configuration Check:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📍 Supabase URL:', supabaseUrl)
  console.log('📍 Supabase Callback (add this to Google Cloud Console):', expectedSupabaseCallback)
  console.log('📍 App Callback (configured in redirectTo):', appCallback)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ In Google Cloud Console, add this redirect URI:')
  console.log('   ', expectedSupabaseCallback)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  return {
    supabaseCallback: expectedSupabaseCallback,
    appCallback,
  }
}




