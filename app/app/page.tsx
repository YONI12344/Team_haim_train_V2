import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { getWeekStart, getWeekDates, formatDateISO, formatPace } from '@/lib/utils'
import { WeekGrid } from '@/components/WeekGrid'
import { Card } from '@/components/Card'
import { StatCard } from '@/components/StatCard'
import { EmptyState } from '@/components/EmptyState'
import type { Workout } from '@/lib/types'

export default async function AthleteDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfile()
  if (!profile) redirect('/login')

  const weekStart = getWeekStart()
  const weekDates = getWeekDates(weekStart)
  const weekEnd = weekDates[6]

  const { data: workouts } = await supabase
    .from('workouts')
    .select('*')
    .eq('athlete_id', user.id)
    .gte('workout_date', formatDateISO(weekStart))
    .lte('workout_date', formatDateISO(weekEnd))
    .order('workout_date')

  const workoutList: Workout[] = workouts || []
  const completed = workoutList.filter(w => w.status === 'completed')
  const totalKm = completed.reduce((s, w) => s + (w.actual_distance_km || 0), 0)
  const avgPaceWorkouts = completed.filter(w => w.actual_pace)
  const avgPace = avgPaceWorkouts.length > 0
    ? avgPaceWorkouts.reduce((s, w) => s + (w.actual_pace || 0), 0) / avgPaceWorkouts.length
    : null
  const completionPct = workoutList.length > 0
    ? Math.round((completed.length / workoutList.length) * 100)
    : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy mb-1">
          שלום, {profile.full_name || 'ספורטאי'} 👋
        </h1>
        <p className="text-gray-500">השבוע שלי — {formatDateISO(weekStart)} עד {formatDateISO(weekEnd)}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={`ק"מ השבוע`} value={totalKm.toFixed(1)} unit={`ק"מ`} />
        <StatCard label="טמפו ממוצע" value={avgPace ? formatPace(avgPace) : '—'} />
        <StatCard label="אימונים הושלמו" value={`${completed.length}/${workoutList.length}`} />
        <StatCard label="אחוז השלמה" value={`${completionPct}%`} trend={completionPct >= 80 ? 'up' : completionPct >= 50 ? 'neutral' : 'down'} />
      </div>

      {/* Week grid */}
      <Card>
        <h2 className="text-lg font-semibold text-navy mb-6">לוח האימונים השבועי</h2>
        {workoutList.length === 0 ? (
          <EmptyState title="אין אימונים השבוע" description="המאמן עוד לא הכין תוכנית לשבוע זה." />
        ) : (
          <WeekGrid weekDates={weekDates} workouts={workoutList} />
        )}
      </Card>
    </div>
  )
}
