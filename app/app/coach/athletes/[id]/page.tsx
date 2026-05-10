import { requireCoach } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { formatDateISO } from '@/lib/utils'
import { CalendarView } from '@/components/CalendarView'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { Workout } from '@/lib/types'

export default async function AthleteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireCoach()
  const supabase = await createClient()

  const { data: athlete } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  const today = new Date()
  const threeMonthsAgo = new Date(today)
  threeMonthsAgo.setMonth(today.getMonth() - 3)
  const threeMonthsAhead = new Date(today)
  threeMonthsAhead.setMonth(today.getMonth() + 3)

  const { data: workouts } = await supabase
    .from('workouts')
    .select('*')
    .eq('athlete_id', id)
    .gte('workout_date', formatDateISO(threeMonthsAgo))
    .lte('workout_date', formatDateISO(threeMonthsAhead))
    .order('workout_date')

  const workoutList: Workout[] = workouts || []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/app/coach" className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-navy">
            {athlete?.full_name || '(ללא שם)'}
          </h1>
          <p className="text-gray-400 text-sm">
            {athlete?.group_name || 'ללא קבוצה'} · תוכנית אימונים
          </p>
        </div>
      </div>

      <CalendarView
        workouts={workoutList}
        isCoach={true}
        athleteId={id}
      />
    </div>
  )
}