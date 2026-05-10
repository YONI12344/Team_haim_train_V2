import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { formatDateISO, formatPace } from '@/lib/utils'
import { CalendarView } from '@/components/CalendarView'
import { StatCard } from '@/components/StatCard'
import type { Workout } from '@/lib/types'

export default async function AthleteDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfile()
  if (!profile) redirect('/login')

  const today = new Date()
  const threeMonthsAgo = new Date(today)
  threeMonthsAgo.setMonth(today.getMonth() - 3)
  const threeMonthsAhead = new Date(today)
  threeMonthsAhead.setMonth(today.getMonth() + 3)

  const { data: workouts } = await supabase
    .from('workouts')
    .select('*')
    .eq('athlete_id', user.id)
    .gte('workout_date', formatDateISO(threeMonthsAgo))
    .lte('workout_date', formatDateISO(threeMonthsAhead))
    .order('workout_date')

  const workoutList: Workout[] = workouts || []

  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const weekWorkouts = workoutList.filter(w =>
    w.workout_date >= formatDateISO(weekStart) &&
    w.workout_date <= formatDateISO(weekEnd)
  )

  const completed = weekWorkouts.filter(w => w.status === 'completed')
  const totalKm = completed.reduce((s, w) => s + (w.actual_distance_km || 0), 0)
  const avgPaceWorkouts = completed.filter(w => w.actual_pace)
  const avgPace = avgPaceWorkouts.length > 0
    ? avgPaceWorkouts.reduce((s, w) => s + (w.actual_pace || 0), 0) / avgPaceWorkouts.length
    : null
  const completionPct = weekWorkouts.length > 0
    ? Math.round((completed.length / weekWorkouts.length) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy mb-1">
          שלום, {profile.full_name || 'ספורטאי'} 👋
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={`ק"מ השבוע`} value={totalKm.toFixed(1)} unit={`ק"מ`} />
        <StatCard label="טמפו ממוצע" value={avgPace ? formatPace(avgPace) : '—'} />
        <StatCard label="אימונים הושלמו" value={`${completed.length}/${weekWorkouts.length}`} />
        <StatCard label="אחוז השלמה" value={`${completionPct}%`} trend={completionPct >= 80 ? 'up' : completionPct >= 50 ? 'neutral' : 'down'} />
      </div>

      <CalendarView
        workouts={workoutList}
        isCoach={profile.role === 'coach'}
      />
    </div>
  )
}