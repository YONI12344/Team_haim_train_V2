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

  // Determine correct role from env var
  const coachEmails = (process.env.COACH_EMAILS || 'info.teamhaim@gmail.com')
    .split(',')
    .map((e) => e.trim().toLowerCase())
  const correctRole = coachEmails.includes((user.email ?? '').toLowerCase()) ? 'coach' : 'athlete'

  // Step 2: read profile via service client (bypasses RLS — no recursion risk)
  const service = await createServiceClient()
  const { data, error } = await service
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (data) {
    // Fix role if it doesn't match the coach email list
    if (data.role !== correctRole) {
      const { data: updatedProfile } = await service
        .from('profiles')
        .update({ role: correctRole })
        .eq('id', user.id)
        .select('*')
        .single()
      return updatedProfile ?? { ...data, role: correctRole }
    }
    return data
  }

  if (error) {
    console.error('Profile lookup failed:', error.message)
    return null
  }

  // Profile doesn't exist yet — create it
  const fullName =
    typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : user.email?.split('@')[0] ?? 'Athlete'

  const { data: createdProfile, error: createError } = await service
    .from('profiles')
    .insert({
      id: user.id,
      full_name: fullName,
      role: correctRole,
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
