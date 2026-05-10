import { cn } from '@/lib/cn'
import { WORKOUT_TYPE_LABELS } from '@/lib/utils'
import type { WorkoutType } from '@/lib/types'

const TYPE_COLORS: Record<string, string> = {
  Easy: 'bg-blue-100 text-blue-800 border-blue-200',
  Tempo: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Intervals: 'bg-orange-100 text-orange-800 border-orange-200',
  'Long Run': 'bg-green-100 text-green-800 border-green-200',
  Recovery: 'bg-purple-100 text-purple-800 border-purple-200',
  Strength: 'bg-red-100 text-red-800 border-red-200',
  Race: 'bg-gold-soft text-navy border-gold/40',
  Rest: 'bg-gray-100 text-gray-600 border-gray-200',
}

interface WorkoutPillProps {
  type: WorkoutType
  className?: string
}

export function WorkoutPill({ type, className }: WorkoutPillProps) {
  return (
    <span className={cn('inline-block rounded-md border px-2 py-0.5 text-xs font-semibold', TYPE_COLORS[type] || TYPE_COLORS.Easy, className)}>
      {WORKOUT_TYPE_LABELS[type] || type}
    </span>
  )
}
