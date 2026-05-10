import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

interface Exercise {
  name: string
  detail: string
}

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workout, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !workout) notFound()

  return (
    <div className="px-4 pt-14 pb-6">
      <Link
        href="/app/workouts"
        className="flex items-center gap-1 text-gray-400 text-sm font-medium mb-8 active:text-gray-200"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        All Workouts
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">{workout.title}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date(workout.created_at).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>

      {(workout.exercises as Exercise[])?.length > 0 && (
        <div className="bg-gray-900 rounded-3xl border border-gray-800/80 p-5 mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
            Exercises
          </p>
          <div className="divide-y divide-gray-800">
            {(workout.exercises as Exercise[]).map((exercise, index) => (
              <div key={index} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <span className="text-white text-sm font-medium">{exercise.name}</span>
                <span className="text-gray-400 text-sm tabular-nums">{exercise.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {workout.notes && (
        <div className="bg-gray-900 rounded-3xl border border-gray-800/80 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Notes</p>
          <p className="text-gray-300 text-sm leading-relaxed">{workout.notes}</p>
        </div>
      )}
    </div>
  )
}
