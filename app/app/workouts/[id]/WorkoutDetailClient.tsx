'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { WorkoutPill } from '@/components/WorkoutPill'
import type { Workout, WorkoutStatus, WorkoutType } from '@/lib/types'
import { ArrowRight, CheckCircle2, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'

interface Props { workout: Workout }

type FormState = {
  actual_distance_km: string
  actual_pace: string
  actual_duration_min: string
  actual_avg_hr: string
  actual_rpe: string
  athlete_notes: string
  status: WorkoutStatus
}

export function WorkoutDetailClient({ workout }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>({
    actual_distance_km: workout.actual_distance_km?.toString() || '',
    actual_pace: workout.actual_pace?.toString() || '',
    actual_duration_min: workout.actual_duration_min?.toString() || '',
    actual_avg_hr: workout.actual_avg_hr?.toString() || '',
    actual_rpe: workout.actual_rpe?.toString() || '',
    athlete_notes: workout.athlete_notes || '',
    status: workout.status,
  })

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase
      .from('workouts')
      .update({
        actual_distance_km: form.actual_distance_km ? parseFloat(form.actual_distance_km) : null,
        actual_pace: form.actual_pace ? parseFloat(form.actual_pace) : null,
        actual_duration_min: form.actual_duration_min ? parseInt(form.actual_duration_min) : null,
        actual_avg_hr: form.actual_avg_hr ? parseInt(form.actual_avg_hr) : null,
        actual_rpe: form.actual_rpe ? parseInt(form.actual_rpe) : null,
        athlete_notes: form.athlete_notes || null,
        status: form.status,
      })
      .eq('id', workout.id)

    setSaving(false)
    if (error) {
      toast.error('שגיאה בשמירה')
    } else {
      toast.success('האימון עודכן בהצלחה!')
      router.refresh()
    }
  }

  function setStatus(status: WorkoutStatus) {
    setForm(f => ({ ...f, status }))
  }

  const statusButtons: { status: WorkoutStatus; label: string; icon: React.ReactNode; color: string }[] = [
    { status: 'completed', label: 'הושלם', icon: <CheckCircle2 className="w-4 h-4" />, color: 'bg-green-500 hover:bg-green-600 text-white' },
    { status: 'in_progress', label: 'בתהליך', icon: <Clock className="w-4 h-4" />, color: 'bg-orange-500 hover:bg-orange-600 text-white' },
    { status: 'missed', label: 'פוספס', icon: <XCircle className="w-4 h-4" />, color: 'bg-red-500 hover:bg-red-600 text-white' },
  ]

  const numericFields: { key: keyof FormState; label: string; type: string; step?: string; min?: string; max?: string }[] = [
    { key: 'actual_distance_km', label: `מרחק (ק"מ)`, type: 'number', step: '0.1' },
    { key: 'actual_pace', label: `טמפו (דק/ק"מ)`, type: 'number', step: '0.1' },
    { key: 'actual_duration_min', label: 'זמן (דקות)', type: 'number' },
    { key: 'actual_avg_hr', label: 'דופק ממוצע', type: 'number' },
    { key: 'actual_rpe', label: 'RPE (1-10)', type: 'number', min: '1', max: '10' },
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
          {statusButtons.map(({ status, label, icon, color }) => (
            <button
              key={status}
              onClick={() => setStatus(status)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all text-sm ${color} ${form.status === status ? 'ring-2 ring-offset-2 ring-navy' : 'opacity-70'}`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </Card>

      {/* Actual section */}
      <Card>
        <h2 className="text-lg font-semibold text-navy mb-4">מה עשיתי בפועל</h2>
        <div className="grid grid-cols-2 gap-4">
          {numericFields.map(({ key, label, type, ...inputProps }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
              <input
                type={type}
                {...inputProps}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-gold focus:border-transparent"
              />
            </div>
          ))}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">הערות</label>
            <textarea
              value={form.athlete_notes}
              onChange={e => setForm(f => ({ ...f, athlete_notes: e.target.value }))}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="mt-6 w-full">
          {saving ? 'שומר...' : 'שמור אימון'}
        </Button>
      </Card>
    </div>
  )
}
