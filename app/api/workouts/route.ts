import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

function formatDateISO(date: Date) {
  return date.toISOString().split('T')[0]
}

function weekStartISO(dateString: string) {
  const date = new Date(dateString)
  const start = new Date(date)
  start.setDate(date.getDate() - date.getDay())
  return formatDateISO(start)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const athleteId = body.athleteId || user.id
  const workoutDate = body.date || body.workout_date || formatDateISO(new Date())

  // Service role bypasses RLS — user identity verified above
  const serviceClient = await createServiceClient()

  const { data: plan, error: planError } = await serviceClient
    .from('training_plans')
    .upsert(
      {
        athlete_id: athleteId,
        week_start: weekStartISO(workoutDate),
        title: 'תוכנית שבועית',
      },
      { onConflict: 'athlete_id,week_start' }
    )
    .select('id')
    .single()

  if (planError || !plan) {
    return NextResponse.json({ error: planError?.message || 'Could not create plan' }, { status: 400 })
  }

  const { data, error } = await serviceClient
    .from('workouts')
    .insert({
      plan_id: plan.id,
      athlete_id: athleteId,
      workout_date: workoutDate,
      workout_type: body.title || body.workout_type || 'Easy',
      planned_notes: body.blocks ? JSON.stringify(body.blocks) : body.planned_notes || null,
      planned_distance_km: body.planned_distance_km ?? null,
      planned_pace: body.planned_pace ?? null,
      planned_duration_min: body.planned_duration_min ?? null,
      planned_intensity: body.planned_intensity ?? null,
      status: body.status || 'planned',
    })
    .select()
    .single()

  if (error) {
    console.error('Workout insert error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data, { status: 201 })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('athlete_id', user.id)
    .order('workout_date', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}
