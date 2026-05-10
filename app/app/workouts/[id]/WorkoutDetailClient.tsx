'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { WorkoutPill } from '@/components/WorkoutPill'
import type { Workout, WorkoutStatus, WorkoutType } from '@/lib/types'
import { ArrowRight, CheckCircle2, Clock, XCircle, Trash2, Pencil, X, Check } from 'lucide-react'
import Link from 'next/link'

interface Props { workout: Workout }

type FormState = {
  actual_distance_km: string
  actual_pace: string
  actual_duration_min: string
  actual_reps: string
  actual_avg_hr: string
  actual_rpe: string
  athlete_notes: string
  status: WorkoutStatus
}

export function WorkoutDetailClient({ workout }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState(false)
  const [editedTitle, setEditedTitle] = useState(workout.workout_type || '')
  const [editedBlocks, setEditedBlocks] = useState<{id: string; type: string; text: string}[]>(() => {
    try { return JSON.parse(workout.planned_notes || '[]') } catch { return [] }
  })

  const [form, setForm] = useState<FormState>({
    actual_distance_km: workout.actual_distance_km?.toString() || '',
    actual_pace: workout.actual_pace?.toString() || '',
    actual_duration_min: workout.actual_duration_min?.toString() || '',
    actual_reps: workout.actual_reps || '',
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
        actual_reps: form.actual_reps || null,
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

  async function handleDelete() {
    if (!confirm('למחוק את האימון?')) return
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workout.id)
    if (error) {
      toast.error('שגיאה במחיקה')
    } else {
      toast.success('האימון נמחק')
      router.push('/app')
    }
  }

  async function handleSaveWorkout() {
    const { error } = await supabase
      .from('workouts')
      .update({
        workout_type: editedTitle,
        planned_notes: JSON.stringify(editedBlocks),
      })
      .eq('id', workout.id)
    if (error) {
      toast.error('שגיאה בשמירה')
    } else {
      toast.success('האימון עודכן!')
      setEditingWorkout(false)
      router.refresh()
    }
  }

  async function handleDeleteNotes() {
    if (!confirm('למחוק את ההערות?')) return
    const { error } = await supabase
      .from('workouts')
      .update({ athlete_notes: null })
      .eq('id', workout.id)
    if (error) {
      toast.error('שגיאה במחיקה')
    } else {
      toast.success('ההערות נמחקו')
      setForm(f => ({ ...f, athlete_notes: '' }))
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
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Link href="/app" className="text-gray-400 hover:text-navy transition-colors">
            <ArrowRight className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-extrabold text-navy">פרטי אימון</h1>
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1 text-red-400 hover:text-red-600 text-sm border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50 transition"
        >
          <Trash2 className="w-4 h-4" />
          מחק
        </button>
      </div>

      {/* Planned section */}
      <Card goldBorder>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-navy">תוכנית המאמן</h2>
          {!editingWorkout ? (
            <button
              onClick={() => setEditingWorkout(true)}
              className="flex items-center gap-1 text-gray-400 hover:text-navy text-sm border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50 transition"
            >
              <Pencil className="w-3.5 h-3.5" />
              ערוך
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSaveWorkout}
                className="flex items-center gap-1 text-green-600 text-sm border border-green-200 px-3 py-1 rounded-lg hover:bg-green-50 transition"
              >
                <Check className="w-3.5 h-3.5" />
                שמור
              </button>
              <button
                onClick={() => setEditingWorkout(false)}
                className="flex items-center gap-1 text-gray-400 text-sm border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50 transition"
              >
                <X className="w-3.5 h-3.5" />
                ביטול
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {editingWorkout ? (
            <div className="space-y-3">
              <input
                value={editedTitle}
                onChange={e => setEditedTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium text-navy focus:ring-2 focus:ring-gold focus:border-transparent"
              />
              <div className="space-y-2">
                {editedBlocks.map((block, idx) => (
                  <div key={block.id} className="flex gap-2">
                    <input
                      value={block.text}
                      onChange={e => {
                        const updated = [...editedBlocks]
                        updated[idx] = { ...block, text: e.target.value }
                        setEditedBlocks(updated)
                      }}
                      className={`flex-1 border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-gold focus:border-transparent ${
                        block.type === 'rest' ? 'border-gray-200 bg-gray-50' :
                        block.type === 'note' ? 'border-yellow-200 bg-yellow-50' :
                        'border-blue-200 bg-blue-50'
                      }`}
                    />
                    <button
                      onClick={() => setEditedBlocks(editedBlocks.filter((_, i) => i !== idx))}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setEditedBlocks([...editedBlocks, { id: Date.now().toString(), type: 'set', text: '' }])}
                  className="text-sm text-blue-500 border border-dashed border-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition w-full"
                >
                  + הוסף שורה
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex gap-2 items-center">
                <WorkoutPill type={workout.workout_type as WorkoutType} />
                <span className="text-sm text-gray-500">{workout.workout_date}</span>
              </div>
              {workout.planned_notes && (() => {
                try {
                  const blocks = JSON.parse(workout.planned_notes)
                  return (
                    <div className="space-y-2 mt-2">
                      {blocks.map((block: {id: string; type: string; text: string}) => (
                        <div key={block.id} className={`text-sm p-2 rounded-lg ${
                          block.type === 'rest' ? 'bg-gray-50 text-gray-500' :
                          block.type === 'note' ? 'bg-yellow-50 text-yellow-700' :
                          'bg-blue-50 text-navy font-medium'
                        }`}>
                          {block.text}
                        </div>
                      ))}
                    </div>
                  )
                } catch {
                  return <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">{workout.planned_notes}</p>
                }
              })()}
            </>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-navy mb-4">סטטוס ביצוע</h2>
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

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-navy">רישום ביצוע</h2>
            <p className="text-sm text-muted">מלא אחרי האימון: זמן, חזרות, קצב, דופק ואיך הרגשת.</p>
          </div>
          {workout.athlete_notes && !editingNotes && (
            <div className="flex gap-2">
              <button
                onClick={() => setEditingNotes(true)}
                className="flex items-center gap-1 text-gray-400 hover:text-navy text-sm border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50 transition"
              >
                <Pencil className="w-3.5 h-3.5" />
                ערוך
              </button>
              <button
                onClick={handleDeleteNotes}
                className="flex items-center gap-1 text-red-400 hover:text-red-600 text-sm border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                מחק
              </button>
            </div>
          )}
        </div>
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
            <label className="block text-sm font-medium text-gray-600 mb-1">חזרות / סטים שבוצעו</label>
            <input
              value={form.actual_reps}
              onChange={e => setForm(f => ({ ...f, actual_reps: e.target.value }))}
              placeholder="לדוגמה: 6x800, מנוחה 90 שניות"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-gold focus:border-transparent"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">הערות לאחר אימון</label>
            <textarea
              value={form.athlete_notes}
              onChange={e => setForm(f => ({ ...f, athlete_notes: e.target.value }))}
              placeholder="איך הרגשת? מה היה קשה? מה הלך טוב?"
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
