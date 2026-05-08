'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Card } from '@/components/Card'
import { WorkoutPill } from '@/components/WorkoutPill'
import { WORKOUT_TYPE_LABELS, HEBREW_DAYS, getWeekDates, formatDateISO, addWeeks } from '@/lib/utils'
import type { Profile, TrainingPlan, Workout, WorkoutType } from '@/lib/types'
import { Plus, Trash2, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const WORKOUT_TYPES: WorkoutType[] = ['Easy', 'Tempo', 'Intervals', 'Long Run', 'Recovery', 'Strength', 'Race', 'Rest']

interface Props {
  athlete: Profile
  plan: TrainingPlan | null
  workouts: Workout[]
  initialWeekStart: string
}

type NewWorkoutState = {
  workout_type: WorkoutType
  planned_distance_km: string
  planned_pace: string
  planned_duration_min: string
  planned_intensity: string
  planned_notes: string
}

export function AthletePlanEditor({ athlete, plan: initialPlan, workouts: initialWorkouts, initialWeekStart }: Props) {
  const supabase = createClient()
  const [weekStart, setWeekStart] = useState(new Date(initialWeekStart))
  const [plan, setPlan] = useState(initialPlan)
  const [workouts, setWorkouts] = useState(initialWorkouts)
  const [addingDate, setAddingDate] = useState<string | null>(null)
  const [newWorkout, setNewWorkout] = useState<NewWorkoutState>({
    workout_type: 'Easy',
    planned_distance_km: '',
    planned_pace: '',
    planned_duration_min: '',
    planned_intensity: '',
    planned_notes: '',
  })

  const weekDates = getWeekDates(weekStart)

  async function navigateWeek(delta: number) {
    const newWeekStart = addWeeks(weekStart, delta)
    setWeekStart(newWeekStart)

    const weekStartStr = formatDateISO(newWeekStart)
    let { data: existingPlan } = await supabase
      .from('training_plans')
      .select('*')
      .eq('athlete_id', athlete.id)
      .eq('week_start', weekStartStr)
      .single()

    if (!existingPlan) {
      const { data: newPlan } = await supabase
        .from('training_plans')
        .insert({ athlete_id: athlete.id, week_start: weekStartStr })
        .select()
        .single()
      existingPlan = newPlan
    }

    setPlan(existingPlan)

    if (existingPlan) {
      const { data: wk } = await supabase
        .from('workouts')
        .select('*')
        .eq('plan_id', existingPlan.id)
        .order('workout_date')
      setWorkouts(wk || [])
    } else {
      setWorkouts([])
    }
  }

  async function addWorkout(date: string) {
    if (!plan) return
    const { data, error } = await supabase
      .from('workouts')
      .insert({
        plan_id: plan.id,
        athlete_id: athlete.id,
        workout_date: date,
        workout_type: newWorkout.workout_type,
        planned_distance_km: newWorkout.planned_distance_km ? parseFloat(newWorkout.planned_distance_km) : null,
        planned_pace: newWorkout.planned_pace ? parseFloat(newWorkout.planned_pace) : null,
        planned_duration_min: newWorkout.planned_duration_min ? parseInt(newWorkout.planned_duration_min) : null,
        planned_intensity: newWorkout.planned_intensity ? parseInt(newWorkout.planned_intensity) : null,
        planned_notes: newWorkout.planned_notes || null,
        status: 'planned',
      })
      .select()
      .single()

    if (error) {
      toast.error('שגיאה בהוספת אימון')
    } else if (data) {
      setWorkouts(w => [...w, data])
      setAddingDate(null)
      setNewWorkout({ workout_type: 'Easy', planned_distance_km: '', planned_pace: '', planned_duration_min: '', planned_intensity: '', planned_notes: '' })
      toast.success('אימון נוסף!')
    }
  }

  async function deleteWorkout(id: string) {
    const { error } = await supabase.from('workouts').delete().eq('id', id)
    if (error) toast.error('שגיאה במחיקה')
    else {
      setWorkouts(w => w.filter(x => x.id !== id))
      toast.success('אימון נמחק')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/app/coach" className="text-gray-400 hover:text-navy transition-colors">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-navy">עריכת תוכנית — {athlete.full_name}</h1>
          <p className="text-gray-500 text-sm">ניהול אימונים שבועיים</p>
        </div>
      </div>

      {/* Week navigation */}
      <Card>
        <div className="flex items-center justify-between">
          <button onClick={() => navigateWeek(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ChevronRight className="w-5 h-5 text-navy" />
          </button>
          <div className="text-center">
            <p className="font-semibold text-navy">{formatDateISO(weekStart)} — {formatDateISO(weekDates[6])}</p>
          </div>
          <button onClick={() => navigateWeek(1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5 text-navy" />
          </button>
        </div>
      </Card>

      {/* Days */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
        {weekDates.map((date, i) => {
          const dateStr = formatDateISO(date)
          const dayWorkouts = workouts.filter(w => w.workout_date === dateStr)

          return (
            <Card key={dateStr} className="p-4">
              <div className="text-center mb-3">
                <p className="text-xs font-bold text-gray-500 uppercase">{HEBREW_DAYS[i]}</p>
                <p className="text-sm text-gray-400">{date.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })}</p>
              </div>

              {dayWorkouts.map(w => (
                <div key={w.id} className="mb-2 p-2 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <WorkoutPill type={w.workout_type as WorkoutType} />
                    <button onClick={() => deleteWorkout(w.id)} className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {w.planned_distance_km && (
                    <p className="text-xs text-gray-500 mt-1">{w.planned_distance_km} {`ק"מ`}</p>
                  )}
                </div>
              ))}

              {addingDate === dateStr ? (
                <div className="space-y-2 mt-2">
                  <select
                    value={newWorkout.workout_type}
                    onChange={e => setNewWorkout(n => ({ ...n, workout_type: e.target.value as WorkoutType }))}
                    className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-gold"
                  >
                    {WORKOUT_TYPES.map(t => (
                      <option key={t} value={t}>{WORKOUT_TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder={`מרחק ק"מ`}
                    value={newWorkout.planned_distance_km}
                    onChange={e => setNewWorkout(n => ({ ...n, planned_distance_km: e.target.value }))}
                    className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5"
                  />
                  <input
                    type="number"
                    placeholder="טמפו"
                    value={newWorkout.planned_pace}
                    onChange={e => setNewWorkout(n => ({ ...n, planned_pace: e.target.value }))}
                    className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5"
                  />
                  <input
                    type="text"
                    placeholder="הערות"
                    value={newWorkout.planned_notes}
                    onChange={e => setNewWorkout(n => ({ ...n, planned_notes: e.target.value }))}
                    className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5"
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={() => addWorkout(dateStr)}
                      className="flex-1 bg-navy text-white text-xs py-1.5 rounded-lg hover:bg-navy-800"
                    >
                      הוסף
                    </button>
                    <button
                      onClick={() => setAddingDate(null)}
                      className="flex-1 bg-gray-100 text-gray-600 text-xs py-1.5 rounded-lg"
                    >
                      ביטול
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingDate(dateStr)}
                  className="w-full mt-2 flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-navy py-1.5 border-2 border-dashed border-gray-200 hover:border-navy/30 rounded-xl transition-all"
                >
                  <Plus className="w-3 h-3" />
                  הוסף
                </button>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
