'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { StatCard } from '@/components/StatCard'
import { Card } from '@/components/Card'
import type { Workout } from '@/lib/types'
import { getWeekStart, formatDateISO, WORKOUT_TYPE_LABELS } from '@/lib/utils'
import { Activity, CheckCircle2, Gauge, Route } from 'lucide-react'

interface Props { workouts: Workout[] }

export function StatsClient({ workouts }: Props) {
  const weeklyData = useMemo(() => {
    const weeks: Record<string, { week: string; km: number; count: number }> = {}
    workouts.filter(w => w.status === 'completed').forEach(w => {
      const d = new Date(w.workout_date)
      const ws = formatDateISO(getWeekStart(d))
      if (!weeks[ws]) weeks[ws] = { week: ws, km: 0, count: 0 }
      weeks[ws].km += w.actual_distance_km || 0
      weeks[ws].count++
    })
    return Object.values(weeks).slice(-8)
  }, [workouts])

  const totalKm = workouts.filter(w => w.status === 'completed').reduce((s, w) => s + (w.actual_distance_km || 0), 0)
  const completed = workouts.filter(w => w.status === 'completed').length
  const completionPct = workouts.length > 0 ? Math.round((completed / workouts.length) * 100) : 0
  const avgPace = workouts.filter(w => w.status === 'completed' && w.actual_pace).reduce((s, w) => s + (w.actual_pace || 0), 0) / Math.max(1, workouts.filter(w => w.status === 'completed' && w.actual_pace).length)

  const typeData = useMemo(() => {
    const counts: Record<string, number> = {}
    workouts.forEach((workout) => {
      counts[workout.workout_type] = (counts[workout.workout_type] || 0) + 1
    })
    return Object.entries(counts).map(([type, value]) => ({
      name: WORKOUT_TYPE_LABELS[type] || type,
      value,
    }))
  }, [workouts])

  const paceData = useMemo(() => {
    return workouts
      .filter((workout) => workout.status === 'completed' && workout.actual_pace)
      .slice(-12)
      .map((workout) => ({
        date: workout.workout_date.slice(5),
        pace: workout.actual_pace,
      }))
  }, [workouts])

  const pieColors = ['#C9A84C', '#1B2A4A', '#94A3B8', '#F59E0B', '#7C3AED', '#DC2626']

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold text-navy">סטטיסטיקות</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={`סה״כ ק״מ`} value={totalKm.toFixed(0)} unit={`ק״מ`} icon={<Route className="h-5 w-5" />} />
        <StatCard label="אימונים הושלמו" value={completed} icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="אחוז השלמה" value={`${completionPct}%`} icon={<Activity className="h-5 w-5" />} />
        <StatCard label="קצב ממוצע" value={avgPace ? avgPace.toFixed(2) : '—'} icon={<Gauge className="h-5 w-5" />} />
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-navy mb-6">{`ק״מ שבועי - 8 שבועות אחרונים`}</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="km" fill="#1B2A4A" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-navy mb-6">חלוקת סוגי אימון</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={typeData} dataKey="value" nameKey="name" outerRadius={92} innerRadius={48} paddingAngle={2}>
                {typeData.map((_, index) => (
                  <Cell key={index} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-navy mb-6">מגמת קצב</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={paceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="pace" stroke="#C9A84C" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}
