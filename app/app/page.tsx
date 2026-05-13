import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { getWeekStart, getWeekDates, formatDateISO, formatPace } from '@/lib/utils'
import { CalendarView } from '@/components/CalendarView'
import { Card } from '@/components/Card'
import { StatCard } from '@/components/StatCard'
import type { Workout } from '@/lib/types'

export default async function AthleteDashboard() {
  const supabase = await createClient()
  let user = null
  try {
    const { data: { user: u } } = await supabase.auth.getUser()
    user = u
  } catch (err) {
    console.error('Failed to get user:', err)
  }
  if (!user) redirect('/login')

  const profile = await getProfile()
  if (!profile) redirect('/login')

  // Safe name derivation
  const safeName = profile.full_name || user.email?.split('@')[0] || 'ספורטאי'

  const weekStart = getWeekStart()
  const weekDates = getWeekDates(weekStart)
  const weekEnd = weekDates[6]

  let workoutList: Workout[] = []
  try {
    const { data: workouts } = await supabase
      .from('workouts')
      .select('*')
      .eq('athlete_id', user.id)
      .order('workout_date')
    workoutList = workouts || []
  } catch (err) {
    console.error('Failed to load workouts:', err)
  }

  const weekWorkouts = workoutList.filter(
    w => w.workout_date >= formatDateISO(weekStart) && w.workout_date <= formatDateISO(weekEnd),
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy mb-1">
          שלום, {safeName} 👋
        </h1>
        <p className="text-gray-500">לוח האימונים שלי</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={`ק"מ השבוע`} value={totalKm.toFixed(1)} unit={`ק"מ`} />
        <StatCard label="טמפו ממוצע" value={avgPace ? formatPace(avgPace) : '—'} />
        <StatCard label="אימונים הושלמו" value={`${completed.length}/${weekWorkouts.length}`} />
        <StatCard label="אחוז השלמה" value={`${completionPct}%`} trend={completionPct >= 80 ? 'up' : completionPct >= 50 ? 'neutral' : 'down'} />
      </div>

      {/* Calendar */}
      <Card>
        <h2 className="text-lg font-semibold text-navy mb-4">לוח האימונים</h2>
        <CalendarView workouts={workoutList} />
      </Card>
    </div>
  )
}
