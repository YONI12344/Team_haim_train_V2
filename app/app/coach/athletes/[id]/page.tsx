import { notFound } from 'next/navigation'
import { requireCoach } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { AthletePlanEditor } from './AthletePlanEditor'
import { getWeekStart, formatDateISO } from '@/lib/utils'

export default async function AthletePlanPage({ params }: { params: { id: string } }) {
  await requireCoach()
  const supabase = createClient()

  const { data: athlete } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!athlete) notFound()

  const weekStart = getWeekStart()

  // Get or create training plan
  let { data: plan } = await supabase
    .from('training_plans')
    .select('*')
    .eq('athlete_id', params.id)
    .eq('week_start', formatDateISO(weekStart))
    .single()

  if (!plan) {
    const { data: newPlan } = await supabase
      .from('training_plans')
      .insert({ athlete_id: params.id, week_start: formatDateISO(weekStart) })
      .select()
      .single()
    plan = newPlan
  }

  const { data: workouts } = plan ? await supabase
    .from('workouts')
    .select('*')
    .eq('plan_id', plan.id)
    .order('workout_date') : { data: [] }

  return <AthletePlanEditor athlete={athlete} plan={plan} workouts={workouts || []} initialWeekStart={formatDateISO(weekStart)} />
}
