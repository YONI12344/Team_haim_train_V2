import { createClient } from '@/lib/supabase/server'
import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const headerStore = await headers()
  const allCookies = cookieStore.getAll()
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  return NextResponse.json({
    cookieCount: allCookies.length,
    cookieNames: allCookies.map(c => c.name),
    supabaseCookies: allCookies
      .filter(c => c.name.includes('supabase') || c.name.includes('sb-'))
      .map(c => ({ name: c.name, valueLength: c.value.length })),
    user: user ? { id: user.id, email: user.email } : null,
    authError: error?.message,
    requestHost: headerStore.get('host'),
    requestOrigin: headerStore.get('origin'),
  })
}
