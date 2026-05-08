'use client'

import Link from 'next/link'
import { CheckCircle2, Clock, XCircle, Circle } from 'lucide-react'
import { HEBREW_DAYS, formatHebrewDate } from '@/lib/utils'
import { WorkoutPill } from './WorkoutPill'
import type { Workout, WorkoutType, WorkoutStatus } from '@/lib/types'

const STATUS_ICONS: Record<WorkoutStatus, React.ReactNode> = {
  planned: <Circle className="w-4 h-4 text-gray-400" />,
  in_progress: <Clock className="w-4 h-4 text-orange-400" />,
  completed: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  missed: <XCircle className="w-4 h-4 text-red-500" />,
}

const STATUS_BG: Record<WorkoutStatus, string> = {
  planned: 'bg-white hover:border-gold/50',
  in_progress: 'bg-orange-50 hover:border-orange-300',
  completed: 'bg-green-50 hover:border-green-300',
  missed: 'bg-red-50 hover:border-red-300',
}

interface WeekGridProps {
  weekDates: Date[]
  workouts: Workout[]
  isCoach?: boolean
}

export function WeekGrid({ weekDates, workouts }: WeekGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {weekDates.map((date, index) => {
        const dateStr = date.toISOString().split('T')[0]
        const workout = workouts.find(w => w.workout_date === dateStr)

        return (
          <div key={dateStr} className="flex flex-col">
            <div className="text-center mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">{HEBREW_DAYS[index]}</p>
              <p className="text-sm text-gray-400">{formatHebrewDate(date)}</p>
            </div>
            {workout ? (
              <Link
                href={`/app/workouts/${workout.id}`}
                className={`flex-1 border-2 border-transparent rounded-2xl p-3 transition-all duration-200 cursor-pointer ${STATUS_BG[workout.status]}`}
              >
                <div className="flex items-center justify-between mb-2">
                  {STATUS_ICONS[workout.status]}
                </div>
                <WorkoutPill type={workout.workout_type as WorkoutType} className="mb-2" />
                {workout.planned_distance_km && (
                  <p className="text-xs text-gray-500 mt-1">{workout.planned_distance_km} {`ק"מ`}</p>
                )}
              </Link>
            ) : (
              <div className="flex-1 border-2 border-dashed border-gray-200 rounded-2xl p-3 flex items-center justify-center">
                <span className="text-xs text-gray-300">אין אימון</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
