import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WorkoutDetailClient } from './WorkoutDetailClient'

export default async function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workout, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !workout) notFound()

  // Verify ownership or coach
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'coach' && workout.athlete_id !== user.id) redirect('/app')

  return <WorkoutDetailClient workout={workout} />
}
