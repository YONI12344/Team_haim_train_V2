import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const checks = {
    url_set: !!url,
    url_value: url?.replace(/^(https:\/\/[^.]+).*/, '$1...'),
    key_set: !!key,
    key_format: key?.startsWith('sb_publishable_') ? 'new ✅' : key?.startsWith('eyJ') ? 'old JWT ⚠️' : 'unknown ❌',
    key_prefix: key?.slice(0, 20) + '...',
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.getSession()
    return NextResponse.json({ 
      ...checks, 
      connection: error ? `❌ ${error.message}` : '✅ OK' 
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ ...checks, connection: `❌ ${msg}` })
  }
}
