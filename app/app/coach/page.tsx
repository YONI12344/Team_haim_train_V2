import { requireCoach } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/Card'
import { EmptyState } from '@/components/EmptyState'
import { StatCard } from '@/components/StatCard'
import Link from 'next/link'
import { Activity, CheckCircle2, ChevronLeft, Route, Users } from 'lucide-react'

export default async function CoachDashboard() {
  await requireCoach()
  const supabase = await createClient()

  const { data: athletes } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'athlete')
    .order('full_name')

  const athleteList = athletes || []

  // Get this week's workout completions for each athlete
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const { data: weekWorkouts } = await supabase
    .from('workouts')
    .select('athlete_id, status, actual_distance_km')
    .gte('workout_date', weekStartStr)

  const workoutMap: Record<string, { total: number; completed: number }> = {}
  let completedCount = 0
  let totalKm = 0
  for (const w of (weekWorkouts || [])) {
    if (!workoutMap[w.athlete_id]) workoutMap[w.athlete_id] = { total: 0, completed: 0 }
    workoutMap[w.athlete_id].total++
    if (w.status === 'completed') {
      workoutMap[w.athlete_id].completed++
      completedCount++
      totalKm += Number((w as { actual_distance_km?: number }).actual_distance_km || 0)
    }
  }
  const totalWorkouts = weekWorkouts?.length || 0
  const completionRate = totalWorkouts > 0 ? Math.round((completedCount / totalWorkouts) * 100) : 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">דשבורד מאמן</h1>
        <Link href="/app/coach/athletes" className="inline-flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors">
          <Users className="w-4 h-4" />
          ניהול ספורטאים
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="ספורטאים פעילים" value={athleteList.length} icon={<Users className="h-5 w-5" />} />
        <StatCard label="אימונים השבוע" value={totalWorkouts} icon={<Activity className="h-5 w-5" />} />
        <StatCard label="אחוז השלמה" value={`${completionRate}%`} icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label={`סה״כ ק״מ`} value={totalKm.toFixed(0)} icon={<Route className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {athleteList.length === 0 ? (
          <div>
            <Card className="py-12">
              <EmptyState title="אין ספורטאים" description="הוסף ספורטאים דרך עמוד ניהול הספורטאים." />
            </Card>
          </div>
        ) : (
          athleteList.map(athlete => {
            const stats = workoutMap[athlete.id] || { total: 0, completed: 0 }
            const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
            return (
              <Link key={athlete.id} href={`/app/coach/athletes/${athlete.id}`}>
                <Card className="cursor-pointer">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-sm font-extrabold text-white">
                        {(athlete.full_name || 'ס')[0]}
                      </div>
                      <div>
                      <h3 className="font-semibold text-navy text-lg">{athlete.full_name || '(ללא שם)'}</h3>
                      {athlete.group_name && (
                        <p className="text-sm text-gray-400">{athlete.group_name}</p>
                      )}
                      </div>
                    </div>
                    <div className="flex min-w-[180px] items-center gap-3">
                      <span className={`rounded-md px-2 py-1 text-xs font-bold ${pct >= 80 ? 'bg-green-100 text-green-700' : pct >= 50 ? 'bg-gold-soft text-navy' : 'bg-red-100 text-red-700'}`}>
                        {pct}% השלמה
                      </span>
                      <ChevronLeft className="w-5 h-5 text-gray-300" />
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
