import { requireCoach } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/Card'
import { EmptyState } from '@/components/EmptyState'
import Link from 'next/link'
import { Users, ChevronLeft } from 'lucide-react'

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
    .select('athlete_id, status')
    .gte('workout_date', weekStartStr)

  const workoutMap: Record<string, { total: number; completed: number }> = {}
  for (const w of (weekWorkouts || [])) {
    if (!workoutMap[w.athlete_id]) workoutMap[w.athlete_id] = { total: 0, completed: 0 }
    workoutMap[w.athlete_id].total++
    if (w.status === 'completed') workoutMap[w.athlete_id].completed++
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">דשבורד מאמן</h1>
        <Link href="/app/coach/athletes" className="inline-flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors">
          <Users className="w-4 h-4" />
          ניהול ספורטאים
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {athleteList.length === 0 ? (
          <div className="col-span-3">
            <Card>
              <EmptyState title="אין ספורטאים" description="הוסף ספורטאים דרך עמוד ניהול הספורטאים." />
            </Card>
          </div>
        ) : (
          athleteList.map(athlete => {
            const stats = workoutMap[athlete.id] || { total: 0, completed: 0 }
            const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
            return (
              <Link key={athlete.id} href={`/app/coach/athletes/${athlete.id}`}>
                <Card className="hover:border-gold/50 border-2 border-transparent transition-all cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-navy text-lg">{athlete.full_name || '(ללא שם)'}</h3>
                      {athlete.group_name && (
                        <p className="text-sm text-gray-400">{athlete.group_name}</p>
                      )}
                    </div>
                    <ChevronLeft className="w-5 h-5 text-gray-300" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">השלמה השבועית</span>
                      <span className="font-semibold text-navy">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-gold' : 'bg-red-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">{stats.completed} מתוך {stats.total} אימונים</p>
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
