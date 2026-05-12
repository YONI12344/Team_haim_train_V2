import { createClient } from '@/lib/supabase/server'
import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const headerStore = await headers()
  const allCookies = cookieStore.getAll()
  const supabaseCookies = allCookies.filter(
    (cookie) => cookie.name.includes('supabase') || cookie.name.startsWith('sb-')
  )

  let user = null
  let session = null
  let userError: string | null = null
  let sessionError: string | null = null

  try {
    const supabase = await createClient()
    const { data: userData, error: uErr } = await supabase.auth.getUser()
    const { data: sessionData, error: sErr } = await supabase.auth.getSession()
    user = userData?.user ?? null
    session = sessionData?.session ?? null
    userError = uErr?.message ?? null
    sessionError = sErr?.message ?? null
  } catch (error) {
    userError = error instanceof Error ? error.message : String(error)
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),

    auth: {
      hasUser: !!user,
      userId: user?.id ?? null,
      userEmail: user?.email ?? null,
      userError,
      hasSession: !!session,
      sessionExpiresAt: session?.expires_at ?? null,
      sessionError,
    },

    cookies: {
      totalCount: allCookies.length,
      allCookieNames: allCookies.map((cookie) => cookie.name),
      supabaseCount: supabaseCookies.length,
      supabaseCookies: supabaseCookies.map((cookie) => ({
        name: cookie.name,
        valueLength: cookie.value.length,
        valuePreview: `${cookie.value.substring(0, 20)}...`,
      })),
    },

    request: {
      host: headerStore.get('host'),
      origin: headerStore.get('origin'),
      referer: headerStore.get('referer'),
      userAgent: headerStore.get('user-agent')?.substring(0, 80),
    },

    env: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseUrlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30),
      hasSiteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV,
    },
  })
}
