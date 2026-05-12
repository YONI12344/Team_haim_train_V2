import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { formatDateISO, formatPace } from '@/lib/utils'
import { StatCard } from '@/components/StatCard'
import { WodSection } from '@/components/WodSection'
import type { Workout } from '@/lib/types'
import { Activity, Gauge, HeartPulse, Route } from 'lucide-react'

// Force dynamic rendering to prevent stale profile data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AthleteDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfile()
  if (profile?.role === 'coach') redirect('/app/coach')
  // Don't redirect to /login when user is authenticated - that causes an infinite loop
  // Handle null profile gracefully with a fallback value

  const today = new Date()
  const todayISO = formatDateISO(today)

  const threeMonthsAgo = new Date(today)
  threeMonthsAgo.setMonth(today.getMonth() - 3)
  const threeMonthsAhead = new Date(today)
  threeMonthsAhead.setMonth(today.getMonth() + 3)

  // Fetch workouts + WOD in parallel
  const [workoutsRes, wodRes] = await Promise.all([
    supabase
      .from('workouts')
      .select('*')
      .eq('athlete_id', user.id)
      .gte('workout_date', formatDateISO(threeMonthsAgo))
      .lte('workout_date', formatDateISO(threeMonthsAhead))
      .order('workout_date'),
    supabase
      .from('workout_of_the_day')
      .select('*, wod_comments(*, profiles(full_name))')
      .eq('date', todayISO)
      .single(),
  ])

  const workoutList: Workout[] = workoutsRes.data || []
  const wod = wodRes.data ?? null

  // Week stats — your original logic
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const weekWorkouts = workoutList.filter(
    (w) =>
      w.workout_date >= formatDateISO(weekStart) &&
      w.workout_date <= formatDateISO(weekEnd)
  )

  const completed = weekWorkouts.filter((w) => w.status === 'completed')
  const totalKm = completed.reduce((s, w) => s + (w.actual_distance_km || 0), 0)
  const avgPaceWorkouts = completed.filter((w) => w.actual_pace)
  const avgPace =
    avgPaceWorkouts.length > 0
      ? avgPaceWorkouts.reduce((s, w) => s + (w.actual_pace || 0), 0) /
        avgPaceWorkouts.length
      : null
  const completionPct =
    weekWorkouts.length > 0
      ? Math.round((completed.length / weekWorkouts.length) * 100)
      : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-3xl font-extrabold text-navy">
          שלום {profile?.full_name || 'ספורטאי'}
        </h1>
        <p className="text-muted">הנה סיכום האימונים שלך השבוע</p>
      </div>

      <WodSection wod={wod} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={`ק״מ השבוע`} value={totalKm.toFixed(1)} unit={`ק״מ`} icon={<Route className="h-5 w-5" />} trend="up" />
        <StatCard label="אימונים הושלמו" value={`${completed.length}/${weekWorkouts.length}`} icon={<Activity className="h-5 w-5" />} />
        <StatCard label="קצב ממוצע" value={avgPace ? formatPace(avgPace) : '—'} icon={<Gauge className="h-5 w-5" />} />
        <StatCard
          label="דופק ממוצע"
          value={`${completionPct}%`}
          icon={<HeartPulse className="h-5 w-5" />}
          trend={completionPct >= 80 ? 'up' : completionPct >= 50 ? 'neutral' : 'down'}
        />
      </div>
    </div>
  )
}
