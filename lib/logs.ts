/**
 * Workout log helpers.
 *
 * Logs are stored directly on the workout row using the "actual_*" columns
 * that are already part of the schema.  The effort level (easy/medium/hard)
 * is persisted via actual_rpe using the conventional mapping below.
 */

import { createClient } from '@/lib/supabase/client'

export type EffortLevel = 'easy' | 'medium' | 'hard'

export interface WorkoutLog {
  workoutId: string
  athleteId: string
  date: string
  actualDistance: number | null
  actualPace: string          // "5:30/km" formatted string
  effort: EffortLevel | null
  comment: string
}

/** Map effort label → numeric RPE value stored in DB */
const EFFORT_TO_RPE: Record<EffortLevel, number> = {
  easy: 3,
  medium: 6,
  hard: 9,
}

/** Map numeric RPE stored in DB → effort label */
export function rpeToEffort(rpe: number | null): EffortLevel | null {
  if (rpe === null) return null
  if (rpe <= 4) return 'easy'
  if (rpe <= 7) return 'medium'
  return 'hard'
}

/**
 * Parse a pace string like "5:30" or "5:30/km" into decimal minutes per km.
 * Returns null for an unparseable input.
 */
export function parsePaceString(pace: string): number | null {
  const clean = pace.replace(/\/km.*$/, '').trim()
  const parts = clean.split(':')
  if (parts.length !== 2) return null
  const min = parseInt(parts[0], 10)
  const sec = parseInt(parts[1], 10)
  if (isNaN(min) || isNaN(sec)) return null
  return min + sec / 60
}

/** Format a decimal minutes-per-km value to "M:SS/km" string. */
export function formatPaceString(pace: number | null): string {
  if (pace === null || pace <= 0) return ''
  const min = Math.floor(pace)
  const sec = Math.round((pace - min) * 60)
  return `${min}:${sec.toString().padStart(2, '0')}/km`
}

/**
 * Fetch the existing log for a workout.
 * Returns null when no data exists or on any error.
 */
export async function getLogForWorkout(
  _athleteId: string,
  workoutId: string,
): Promise<WorkoutLog | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('workouts')
      .select('id, athlete_id, workout_date, actual_distance_km, actual_pace, actual_rpe, athlete_notes')
      .eq('id', workoutId)
      .single()

    if (error || !data) return null

    return {
      workoutId: data.id,
      athleteId: data.athlete_id,
      date: data.workout_date,
      actualDistance: data.actual_distance_km,
      actualPace: formatPaceString(data.actual_pace),
      effort: rpeToEffort(data.actual_rpe),
      comment: data.athlete_notes || '',
    }
  } catch (err) {
    console.error('getLogForWorkout error:', err)
    return null
  }
}

/**
 * Save (upsert) a workout log.
 * Updates the existing workout row in place.
 */
export async function saveLog(log: WorkoutLog): Promise<{ error: string | null }> {
  try {
    const supabase = createClient()
    const paceNum = log.actualPace ? parsePaceString(log.actualPace) : null
    const rpe = log.effort ? EFFORT_TO_RPE[log.effort] : null

    const { error } = await supabase
      .from('workouts')
      .update({
        actual_distance_km: log.actualDistance,
        actual_pace: paceNum,
        actual_rpe: rpe,
        athlete_notes: log.comment || null,
        status: 'completed',
      })
      .eq('id', log.workoutId)

    if (error) {
      console.error('saveLog error:', error)
      return { error: error.message }
    }
    return { error: null }
  } catch (err) {
    console.error('saveLog exception:', err)
    return { error: 'שגיאה בשמירת הלוג' }
  }
}
