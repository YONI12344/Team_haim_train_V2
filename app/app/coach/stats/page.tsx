import { requireCoach } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { TeamStatsClient } from './TeamStatsClient'

export default async function TeamStatsPage() {
  await requireCoach()
  const supabase = await createClient()

  const { data: workouts } = await supabase
    .from('workouts')
    .select('*, profiles(full_name)')
    .order('workout_date', { ascending: false })

  const { data: athletes } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'athlete')

  return <TeamStatsClient workouts={workouts || []} athletes={athletes || []} />
}
