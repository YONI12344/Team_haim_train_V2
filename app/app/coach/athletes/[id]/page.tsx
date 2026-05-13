import { notFound } from 'next/navigation'
import { requireCoach } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { AthletePlanEditor } from './AthletePlanEditor'
import { getWeekStart, formatDateISO } from '@/lib/utils'

export default async function AthletePlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireCoach()
  const supabase = await createClient()

  let athlete = null
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    athlete = data
  } catch (err) {
    console.error('Failed to load athlete:', err)
  }

  if (!athlete) notFound()

  const weekStart = getWeekStart()

  // Get or create training plan
  let plan = null
  try {
    const { data: existingPlan } = await supabase
      .from('training_plans')
      .select('*')
      .eq('athlete_id', id)
      .eq('week_start', formatDateISO(weekStart))
      .single()
    plan = existingPlan
  } catch {
    // No plan yet – will be created below
  }

  if (!plan) {
    try {
      const { data: newPlan } = await supabase
        .from('training_plans')
        .insert({ athlete_id: id, week_start: formatDateISO(weekStart) })
        .select()
        .single()
      plan = newPlan
    } catch (err) {
      console.error('Failed to create training plan:', err)
    }
  }

  let workouts = []
  if (plan) {
    try {
      const { data } = await supabase
        .from('workouts')
        .select('*')
        .eq('plan_id', plan.id)
        .order('workout_date')
      workouts = data || []
    } catch (err) {
      console.error('Failed to load workouts:', err)
    }
  }

  return <AthletePlanEditor athlete={athlete} plan={plan} workouts={workouts} initialWeekStart={formatDateISO(weekStart)} />
}
