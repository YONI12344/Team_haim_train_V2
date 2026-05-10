import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/auth'
import { CalendarView } from '@/components/CalendarView'
import { CalendarDays } from 'lucide-react'

export default async function WorkoutsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfile()
  const athleteId = profile?.role === 'coach' ? undefined : user.id
  const { data: workouts } = await supabase
    .from('workouts')
    .select('*')
    .eq(profile?.role === 'coach' ? 'athlete_id' : 'athlete_id', athleteId || user.id)
    .order('workout_date')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-soft text-gold-dark">
          <CalendarDays className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-navy">לוח שנה</h1>
          <p className="text-sm text-muted">תצוגה שבועית וחודשית של האימונים</p>
        </div>
      </div>
      <CalendarView workouts={workouts || []} isCoach={profile?.role === 'coach'} athleteId={athleteId} />
    </div>
  )
}
