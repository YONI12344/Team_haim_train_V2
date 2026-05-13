'use client'

/**
 * WorkoutLogForm – lets an athlete fill in post-workout details.
 * After saving, the parent can react via onSaved().
 */

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2 } from 'lucide-react'
import type { Workout } from '@/lib/types'
import {
  type EffortLevel,
  getLogForWorkout,
  saveLog,
} from '@/lib/logs'

interface Props {
  workout: Workout
  athleteId: string
  onSaved?: () => void
}

const EFFORT_BUTTONS: { level: EffortLevel; label: string; color: string; activeColor: string }[] = [
  { level: 'easy', label: 'קל', color: 'border-green-300 text-green-700 hover:bg-green-50', activeColor: 'bg-green-500 border-green-500 text-white' },
  { level: 'medium', label: 'בינוני', color: 'border-yellow-300 text-yellow-700 hover:bg-yellow-50', activeColor: 'bg-yellow-500 border-yellow-500 text-white' },
  { level: 'hard', label: 'קשה', color: 'border-red-300 text-red-700 hover:bg-red-50', activeColor: 'bg-red-500 border-red-500 text-white' },
]

export function WorkoutLogForm({ workout, athleteId, onSaved }: Props) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [actualDistance, setActualDistance] = useState('')
  const [actualPace, setActualPace] = useState('')
  const [effort, setEffort] = useState<EffortLevel | null>(null)
  const [comment, setComment] = useState('')

  // Prefill form if athlete already logged this workout
  useEffect(() => {
    let cancelled = false
    getLogForWorkout(athleteId, workout.id)
      .then(log => {
        if (cancelled || !log) return
        setActualDistance(log.actualDistance?.toString() ?? '')
        setActualPace(log.actualPace ?? '')
        setEffort(log.effort)
        setComment(log.comment ?? '')
        // If the workout already has actual data, mark as saved
        if (log.actualDistance || log.actualPace || log.effort || log.comment) {
          setSaved(true)
        }
      })
      .catch(() => {/* ignore – just render empty form */})
    return () => { cancelled = true }
  }, [athleteId, workout.id])

  async function handleSave() {
    setSaving(true)
    const { error } = await saveLog({
      workoutId: workout.id,
      athleteId,
      date: workout.workout_date,
      actualDistance: actualDistance ? parseFloat(actualDistance) : null,
      actualPace: actualPace,
      effort,
      comment,
    })
    setSaving(false)
    if (error) {
      toast.error('שגיאה בשמירת הלוג')
    } else {
      toast.success('הלוג נשמר!')
      setSaved(true)
      onSaved?.()
    }
  }

  return (
    <div className="mt-4 border-t border-gray-100 pt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">לוג האימון</h3>
        {saved && (
          <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4" />
            נשמר
          </span>
        )}
      </div>

      {/* Distance + Pace row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{`מרחק בפועל (ק"מ)`}</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={actualDistance}
            onChange={e => setActualDistance(e.target.value)}
            placeholder="10.0"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-gold focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{`טמפו בפועל (דק/ק"מ)`}</label>
          <input
            type="text"
            value={actualPace}
            onChange={e => setActualPace(e.target.value)}
            placeholder="5:30/km"
            dir="ltr"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-gold focus:border-transparent"
          />
        </div>
      </div>

      {/* Effort level */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">רמת מאמץ</p>
        <div className="flex gap-2">
          {EFFORT_BUTTONS.map(({ level, label, color, activeColor }) => (
            <button
              key={level}
              type="button"
              onClick={() => setEffort(prev => prev === level ? null : level)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${effort === level ? activeColor : color}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">הערות (איך הרגשת, מה עשית)</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          placeholder="היה אימון מעולה, הרגשתי חזק..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-navy hover:bg-navy-800 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {saving ? 'שומר...' : saved ? 'עדכן לוג' : 'שמור לוג'}
      </button>
    </div>
  )
}
