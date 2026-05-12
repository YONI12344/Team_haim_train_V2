import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/lib/types'

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getProfile(): Promise<Profile | null> {
  // Step 1: verify identity via anon client (reads cookies/session)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Step 2: read profile via service client (bypasses RLS — no recursion risk)
  const service = await createServiceClient()
  const { data, error } = await service
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (data) return data

  if (error) {
    console.error('Profile lookup failed:', error.message)
    return null
  }

  // Profile doesn't exist yet — create it
  // Determine correct role: check coach emails env var first, then fallback to athlete
  const coachEmails = (process.env.COACH_EMAILS || 'info.teamhaim@gmail.com')
    .split(',')
    .map((e) => e.trim().toLowerCase())
  const isCoach = coachEmails.includes((user.email ?? '').toLowerCase())

  const fullName =
    typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : user.email?.split('@')[0] ?? 'Athlete'

  const { data: createdProfile, error: createError } = await service
    .from('profiles')
    .insert({
      id: user.id,
      full_name: fullName,
      role: isCoach ? 'coach' : 'athlete',
    })
    .select('*')
    .single()

  if (createError) {
    console.error('Profile creation failed:', createError.message)
    return null
  }

  return createdProfile
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) redirect('/login')
  return user
}

export async function requireCoach() {
  const profile = await getProfile()
  if (!profile || profile.role !== 'coach') redirect('/app')
  return profile
}
