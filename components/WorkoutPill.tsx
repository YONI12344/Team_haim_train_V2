import { cn } from '@/lib/cn'
import { WORKOUT_TYPE_LABELS } from '@/lib/utils'
import type { WorkoutType } from '@/lib/types'

const TYPE_COLORS: Record<WorkoutType, string> = {
  Easy: 'bg-green-100 text-green-800',
  Tempo: 'bg-orange-100 text-orange-800',
  Intervals: 'bg-red-100 text-red-800',
  'Long Run': 'bg-blue-100 text-blue-800',
  Recovery: 'bg-teal-100 text-teal-800',
  Strength: 'bg-purple-100 text-purple-800',
  Race: 'bg-yellow-100 text-yellow-800',
  Rest: 'bg-gray-100 text-gray-600',
}

interface WorkoutPillProps {
  type: WorkoutType
  className?: string
}

export function WorkoutPill({ type, className }: WorkoutPillProps) {
  return (
    <span className={cn('inline-block px-2 py-0.5 rounded-full text-xs font-semibold', TYPE_COLORS[type], className)}>
      {WORKOUT_TYPE_LABELS[type] || type}
    </span>
  )
}
