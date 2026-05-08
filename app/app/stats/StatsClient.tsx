'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { StatCard } from '@/components/StatCard'
import { Card } from '@/components/Card'
import type { Workout } from '@/lib/types'
import { getWeekStart, formatDateISO } from '@/lib/utils'

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

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-navy">הסטטיסטיקות שלי</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={`סה"כ ק"מ`} value={totalKm.toFixed(0)} unit={`ק"מ`} />
        <StatCard label="אימונים הושלמו" value={completed} />
        <StatCard label="אחוז השלמה" value={`${completionPct}%`} />
        <StatCard label={`סה"כ אימונים`} value={workouts.length} />
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-navy mb-6">{`ק"מ שבועי`}</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="km" fill="#C9A84C" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
