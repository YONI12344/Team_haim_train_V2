import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/auth'
import { ProfileClient } from './ProfileClient'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfile()
  if (!profile) redirect('/login')

  const [{ data: athleteProfile }, { count: workoutCount }] = await Promise.all([
    supabase.from('athlete_profiles').select('*').eq('athlete_id', user.id).maybeSingle(),
    supabase.from('workouts').select('id', { count: 'exact', head: true }).eq('athlete_id', user.id),
  ])

  return (
    <ProfileClient
      profile={profile}
      athleteProfile={athleteProfile}
      email={user.email || ''}
      workoutCount={workoutCount || 0}
    />
  )
}
