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

  const response = NextResponse.redirect(`${origin}/app`)

  // Add cache headers to prevent stale data
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Set cookies on the request for server components to read
            request.cookies.set(name, value)
            // Set cookies on the response to send to the browser
            response.cookies.set(name, value, {
              ...options,
              path: '/',
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            })
          })
        },
      },
    }
  )

  const { error, data } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Callback error:', error.message)
    return NextResponse.redirect(
      `${origin}/login?error=auth_failed&message=${encodeURIComponent(error.message)}`
    )
  }

  // Ensure profile is created/updated with correct role immediately after login
  if (data?.user) {
    const serviceClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return [] },
          setAll() {},
        },
      }
    )

    // Determine correct role from env var
    const coachEmails = (process.env.COACH_EMAILS || 'info.teamhaim@gmail.com')
      .split(',')
      .map((e) => e.trim().toLowerCase())
    const correctRole = coachEmails.includes((data.user.email ?? '').toLowerCase()) ? 'coach' : 'athlete'

    // Check if profile exists
    const { data: existingProfile } = await serviceClient
      .from('profiles')
      .select('id, role')
      .eq('id', data.user.id)
      .maybeSingle()

    if (existingProfile) {
      // Update role if incorrect
      if (existingProfile.role !== correctRole) {
        await serviceClient
          .from('profiles')
          .update({ role: correctRole })
          .eq('id', data.user.id)
      }
    } else {
      // Create profile with correct role
      const fullName =
        typeof data.user.user_metadata?.full_name === 'string'
          ? data.user.user_metadata.full_name
          : data.user.email?.split('@')[0] ?? 'Athlete'

      await serviceClient
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: fullName,
          role: correctRole,
        })
    }
  }

  return response
}
