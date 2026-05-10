import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function StatsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workouts } = await supabase
    .from('workouts')
    .select('id, title, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const now = new Date()

  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const thisWeek = workouts?.filter((w) => new Date(w.created_at) >= startOfWeek).length || 0
  const thisMonth =
    workouts?.filter((w) => {
      const d = new Date(w.created_at)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length || 0

  const stats = [
    { label: 'This Week', value: thisWeek },
    { label: 'This Month', value: thisMonth },
    { label: 'All Time', value: workouts?.length || 0 },
  ]

  return (
    <div className="px-4 pt-14 pb-6">
      <h1 className="text-2xl font-bold text-white tracking-tight mb-8">Stats</h1>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="bg-gray-900 border border-gray-800/80 rounded-2xl p-4 text-center"
          >
            <p className="text-orange-400 text-2xl font-bold tabular-nums">{value}</p>
            <p className="text-gray-500 text-xs mt-1 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
        Workout History
      </h2>

      {workouts?.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-sm">No workouts logged yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {workouts?.map((workout) => (
            <div
              key={workout.id}
              className="flex items-center justify-between bg-gray-900 border border-gray-800/80 rounded-2xl px-4 py-4"
            >
              <span className="text-white text-sm font-medium">{workout.title}</span>
              <span className="text-gray-500 text-xs tabular-nums">
                {new Date(workout.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
