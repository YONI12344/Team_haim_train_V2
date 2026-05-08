import { requireCoach } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/Card'
import { EmptyState } from '@/components/EmptyState'
import { InviteAthleteForm } from './InviteAthleteForm'
import Link from 'next/link'
import { ChevronLeft, UserPlus } from 'lucide-react'

export default async function AthletesPage() {
  await requireCoach()
  const supabase = await createClient()

  const { data: athletes } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'athlete')
    .order('full_name')

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-navy">ניהול ספורטאים</h1>

      <Card goldBorder>
        <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-gold" />
          הזמן ספורטאי חדש
        </h2>
        <InviteAthleteForm />
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-navy mb-4">כל הספורטאים</h2>
        {!athletes || athletes.length === 0 ? (
          <EmptyState title="אין ספורטאים" description="הזמן ספורטאים באמצעות הטופס למעלה." />
        ) : (
          <div className="divide-y divide-gray-100">
            {athletes.map(a => (
              <Link
                key={a.id}
                href={`/app/coach/athletes/${a.id}`}
                className="flex items-center justify-between py-3 hover:bg-gray-50 px-2 rounded-xl transition-colors"
              >
                <div>
                  <p className="font-medium text-navy">{a.full_name || '(ללא שם)'}</p>
                  <p className="text-sm text-gray-400">{a.group_name || 'ללא קבוצה'}</p>
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-300" />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
