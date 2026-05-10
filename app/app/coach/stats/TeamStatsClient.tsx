'use client'

import { Card } from '@/components/Card'
import { StatCard } from '@/components/StatCard'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface AthleteStats {
  name: string
  completed: number
  total: number
  km: number
}

interface Props {
  workouts: Array<{
    athlete_id: string
    status: string
    actual_distance_km: number | null
  }>
  athletes: { id: string; full_name: string | null }[]
}

export function TeamStatsClient({ workouts, athletes }: Props) {
  const completed = workouts.filter(w => w.status === 'completed')
  const totalKm = completed.reduce((s, w) => s + (w.actual_distance_km || 0), 0)
  const completionPct = workouts.length > 0 ? Math.round((completed.length / workouts.length) * 100) : 0

  const athleteStats: AthleteStats[] = athletes.map(a => {
    const aw = workouts.filter(w => w.athlete_id === a.id)
    const ac = aw.filter(w => w.status === 'completed')
    return {
      name: a.full_name || 'ספורטאי',
      completed: ac.length,
      total: aw.length,
      km: ac.reduce((s, w) => s + (w.actual_distance_km || 0), 0),
    }
  })

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-navy">סטטיסטיקות קבוצה</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="ספורטאים" value={athletes.length} />
        <StatCard label={`סה"כ ק"מ`} value={totalKm.toFixed(0)} unit={`ק"מ`} />
        <StatCard label="אימונים הושלמו" value={completed.length} />
        <StatCard label="אחוז השלמה" value={`${completionPct}%`} />
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-navy mb-6">{`ק"מ לפי ספורטאי`}</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={athleteStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="km" fill="#1B2A4A" radius={[4, 4, 0, 0]} name={`ק"מ`} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-navy mb-4">פירוט לפי ספורטאי</h2>
        <div className="space-y-3">
          {athleteStats.map(a => {
            const pct = a.total > 0 ? Math.round((a.completed / a.total) * 100) : 0
            return (
              <div key={a.name} className="flex items-center gap-4">
                <span className="w-32 text-sm font-medium text-navy truncate">{a.name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-gold' : 'bg-red-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-12 text-left">{pct}%</span>
                <span className="text-sm text-gray-400 w-16">{a.km.toFixed(0)} {`ק"מ`}</span>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
