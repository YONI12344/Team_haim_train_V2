'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Card } from '@/components/Card'
import { WorkoutPill } from '@/components/WorkoutPill'
import { WorkoutLogForm } from '@/components/WorkoutLogForm'
import type { Workout, WorkoutStatus, WorkoutType } from '@/lib/types'
import { ArrowRight, CheckCircle2, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'

interface Props { workout: Workout; athleteId: string }

export function WorkoutDetailClient({ workout, athleteId }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<WorkoutStatus>(workout.status)

  async function handleStatusChange(newStatus: WorkoutStatus) {
    setStatus(newStatus)
    setSaving(true)
    try {
      const { error } = await supabase
        .from('workouts')
        .update({ status: newStatus })
        .eq('id', workout.id)
      if (error) {
        toast.error('שגיאה בעדכון סטטוס')
        setStatus(workout.status) // revert
      } else {
        toast.success('סטטוס עודכן!')
        router.refresh()
      }
    } catch {
      toast.error('שגיאה בעדכון סטטוס')
      setStatus(workout.status)
    } finally {
      setSaving(false)
    }
  }

  const statusButtons: { status: WorkoutStatus; label: string; icon: React.ReactNode; color: string }[] = [
    { status: 'completed', label: 'הושלם', icon: <CheckCircle2 className="w-4 h-4" />, color: 'bg-green-500 hover:bg-green-600 text-white' },
    { status: 'in_progress', label: 'בתהליך', icon: <Clock className="w-4 h-4" />, color: 'bg-orange-500 hover:bg-orange-600 text-white' },
    { status: 'missed', label: 'פוספס', icon: <XCircle className="w-4 h-4" />, color: 'bg-red-500 hover:bg-red-600 text-white' },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/app" className="text-gray-400 hover:text-navy transition-colors">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-navy">האימון שלי</h1>
      </div>

      {/* Planned section */}
      <Card goldBorder>
        <h2 className="text-lg font-semibold text-navy mb-4">תוכנית המאמן</h2>
        <div className="space-y-3">
          <div className="flex gap-2 items-center">
            <WorkoutPill type={workout.workout_type as WorkoutType} />
            <span className="text-sm text-gray-500">{workout.workout_date}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {workout.planned_distance_km && (
              <div><span className="text-gray-500">מרחק:</span> <span className="font-medium">{workout.planned_distance_km} {`ק"מ`}</span></div>
            )}
            {workout.planned_pace && (
              <div><span className="text-gray-500">טמפו:</span> <span className="font-medium">{workout.planned_pace} {`דק/ק"מ`}</span></div>
            )}
            {workout.planned_duration_min && (
              <div><span className="text-gray-500">זמן:</span> <span className="font-medium">{workout.planned_duration_min} דקות</span></div>
            )}
            {workout.planned_intensity && (
              <div><span className="text-gray-500">עצימות:</span> <span className="font-medium">{workout.planned_intensity}/10</span></div>
            )}
          </div>
          {workout.planned_notes && (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">{workout.planned_notes}</p>
          )}
        </div>
      </Card>

      {/* Status buttons */}
      <Card>
        <h2 className="text-lg font-semibold text-navy mb-4">סמן סטטוס</h2>
        <div className="flex gap-3 flex-wrap">
          {statusButtons.map(({ status: s, label, icon, color }) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all text-sm ${color} ${status === s ? 'ring-2 ring-offset-2 ring-navy' : 'opacity-70'} disabled:cursor-not-allowed`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </Card>

      {/* Log form */}
      <Card>
        <h2 className="text-lg font-semibold text-navy mb-2">יומן האימון</h2>
        <p className="text-sm text-gray-500 mb-4">מלא את הפרטים על האימון שביצעת בפועל</p>
        <WorkoutLogForm
          workout={workout}
          athleteId={athleteId}
          onSaved={() => router.refresh()}
        />
      </Card>
    </div>
  )
}
