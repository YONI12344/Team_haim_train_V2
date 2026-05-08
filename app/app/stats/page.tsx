import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatsClient } from './StatsClient'

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workouts } = await supabase
    .from('workouts')
    .select('*')
    .eq('athlete_id', user.id)
    .order('workout_date')

  return <StatsClient workouts={workouts || []} />
}
