import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  // We must collect cookies BEFORE creating the redirect response
  const cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(incoming) {
          // Collect cookies — apply them to the response after we build it
          incoming.forEach(({ name, value, options }) => {
            cookiesToSet.push({ name, value, options: options as Record<string, unknown> })
          })
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Callback error:', error.message)
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  // Build the redirect response AFTER session exchange so all cookies are known
  const response = NextResponse.redirect(`${origin}/app`)

  // Apply all session cookies to the response
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, {
      ...options,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      path: '/',
    })
  })

  return response
}
