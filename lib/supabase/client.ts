import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true, // 👈 Garde la session active
        autoRefreshToken: true, // 👈 Rafraîchit le token
        detectSessionInUrl: true
      },
      cookieOptions: {
        maxAge: 60 * 60 * 24 * 365, // 👈 Garde le cookie pendant 1 an !
      }
    }
  )
}