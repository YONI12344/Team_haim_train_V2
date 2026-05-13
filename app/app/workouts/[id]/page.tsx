import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WorkoutDetailClient } from './WorkoutDetailClient'

export default async function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  let user = null
  try {
    const { data: { user: u } } = await supabase.auth.getUser()
    user = u
  } catch (err) {
    console.error('Failed to get user:', err)
  }
  if (!user) redirect('/login')

  let workout = null
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', id)
      .single()
    if (error || !data) notFound()
    workout = data
  } catch {
    notFound()
  }

  if (!workout) notFound()

  // Verify ownership or coach
  try {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'coach' && workout.athlete_id !== user.id) redirect('/app')
  } catch {
    // If we can't verify, only allow if owner
    if (workout.athlete_id !== user.id) redirect('/app')
  }

  return <WorkoutDetailClient workout={workout} athleteId={user.id} />
}
