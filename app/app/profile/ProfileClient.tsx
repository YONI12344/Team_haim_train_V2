'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import type { AthleteProfile, Profile } from '@/lib/types'
import { AtSign, Flag, Save, Trophy, User } from 'lucide-react'

type Props = {
  profile: Profile | null
  athleteProfile: AthleteProfile | null
  email: string
  workoutCount: number
}

const paceFields = [
  ['easy_pace', 'קצב קל'],
  ['tempo_pace', 'קצב טמפו'],
  ['interval_pace', 'קצב אינטרוולים'],
  ['race_pace_1500', 'קצב תחרות 1500'],
  ['race_pace_2000', 'קצב תחרות 2000'],
  ['race_pace_3000', 'קצב תחרות 3000'],
  ['race_pace_5000', 'קצב תחרות 5000'],
  ['race_pace_10000', 'קצב תחרות 10K'],
  ['race_pace_half_marathon', 'קצב חצי מרתון'],
  ['race_pace_marathon', 'קצב מרתון'],
] as const

const raceRows = [
  ['1500', '1500 מטר', 'pr_1500', 'goal_1500'],
  ['2000', '2000 מטר', 'pr_2000', 'goal_2000'],
  ['3000', '3000 מטר', 'pr_3000', 'goal_3000'],
  ['5000', '5000 מטר', 'pr_5000', 'goal_5000'],
  ['10000', '10 ק״מ', 'pr_10000', 'goal_10000'],
  ['half', 'חצי מרתון', 'pr_half_marathon', 'goal_half_marathon'],
  ['marathon', 'מרתון', 'pr_marathon', 'goal_marathon'],
] as const

type FormState = Partial<AthleteProfile> & Pick<Profile, 'full_name' | 'phone'>

export function ProfileClient({ profile, athleteProfile, email, workoutCount }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    ...athleteProfile,
  })

  const initials = useMemo(() => {
    return (profile?.full_name || email || 'T')
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }, [profile?.full_name, email])

  function update(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSave() {
    if (!profile?.id) return
    setSaving(true)

    const [profileResult, extendedResult] = await Promise.all([
      supabase
        .from('profiles')
        .update({ full_name: form.full_name || null, phone: form.phone || null })
        .eq('id', profile.id),
      supabase
        .from('athlete_profiles')
        .upsert(
          {
            athlete_id: profile.id,
            easy_pace: form.easy_pace || null,
            tempo_pace: form.tempo_pace || null,
            interval_pace: form.interval_pace || null,
            race_pace_1500: form.race_pace_1500 || null,
            race_pace_2000: form.race_pace_2000 || null,
            race_pace_3000: form.race_pace_3000 || null,
            race_pace_5000: form.race_pace_5000 || null,
            race_pace_10000: form.race_pace_10000 || null,
            race_pace_half_marathon: form.race_pace_half_marathon || null,
            race_pace_marathon: form.race_pace_marathon || null,
            pr_1500: form.pr_1500 || null,
            pr_2000: form.pr_2000 || null,
            pr_3000: form.pr_3000 || null,
            pr_5000: form.pr_5000 || null,
            pr_10000: form.pr_10000 || null,
            pr_half_marathon: form.pr_half_marathon || null,
            pr_marathon: form.pr_marathon || null,
            goal_1500: form.goal_1500 || null,
            goal_2000: form.goal_2000 || null,
            goal_3000: form.goal_3000 || null,
            goal_5000: form.goal_5000 || null,
            goal_10000: form.goal_10000 || null,
            goal_half_marathon: form.goal_half_marathon || null,
            goal_marathon: form.goal_marathon || null,
            main_goal: form.main_goal || null,
            coach_notes: form.coach_notes || null,
          },
          { onConflict: 'athlete_id' }
        ),
    ])

    setSaving(false)
    if (profileResult.error || extendedResult.error) {
      toast.error('שגיאה בשמירת הפרופיל')
      return
    }
    toast.success('הפרופיל נשמר')
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Card className="text-center">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gold text-3xl font-extrabold text-white">
          {initials}
        </div>
        <h1 className="text-3xl font-extrabold text-navy">{profile?.full_name || 'ספורטאי'}</h1>
        <div className="mt-3 flex flex-wrap justify-center gap-2 text-sm text-muted">
          <span className="inline-flex items-center gap-1 rounded-md bg-gold-soft px-2 py-1 font-semibold text-navy">
            <User className="h-4 w-4" />
            {profile?.role === 'coach' ? 'מאמן' : 'ספורטאי'}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1">
            <AtSign className="h-4 w-4" />
            {email}
          </span>
          <span className="rounded-md bg-gray-100 px-2 py-1">{workoutCount} אימונים</span>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-navy">
            <User className="h-5 w-5 text-gold" />
            פרטים אישיים
          </h2>
          <div className="space-y-4">
            <TextField label="שם מלא" value={form.full_name || ''} onChange={(value) => update('full_name', value)} />
            <TextField label="טלפון" value={form.phone || ''} onChange={(value) => update('phone', value)} />
            <TextArea label="מטרה מרכזית" value={form.main_goal || ''} onChange={(value) => update('main_goal', value)} placeholder="לדוגמה: לשפר 5000 מטר מתחת ל-18:30" />
            <TextArea label="הערות מאמן / רקע" value={form.coach_notes || ''} onChange={(value) => update('coach_notes', value)} placeholder="עומסים, פציעות, נקודות לעבוד עליהן..." />
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-navy">
            <Flag className="h-5 w-5 text-gold" />
            קצבי אימון ותחרות
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {paceFields.map(([key, label]) => (
              <TextField
                key={key}
                label={label}
                value={(form[key] as string) || ''}
                onChange={(value) => update(key, value)}
                placeholder="לדוגמה: 4:20 דק/ק״מ"
              />
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-navy">
          <Trophy className="h-5 w-5 text-gold" />
          שיאים אישיים ומטרות
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-right text-muted">
                <th className="px-3 py-2 font-semibold">מקצה</th>
                <th className="px-3 py-2 font-semibold">PR</th>
                <th className="px-3 py-2 font-semibold">מטרה</th>
              </tr>
            </thead>
            <tbody>
              {raceRows.map(([id, label, prKey, goalKey]) => (
                <tr key={id} className="bg-gray-50">
                  <td className="rounded-r-lg px-3 py-3 font-bold text-navy">{label}</td>
                  <td className="px-3 py-3">
                    <input
                      value={(form[prKey] as string) || ''}
                      onChange={(event) => update(prKey, event.target.value)}
                      className="w-full rounded-md border border-border bg-white px-3 py-2 outline-none focus:border-gold"
                      placeholder="00:00"
                    />
                  </td>
                  <td className="rounded-l-lg px-3 py-3">
                    <input
                      value={(form[goalKey] as string) || ''}
                      onChange={(event) => update(goalKey, event.target.value)}
                      className="w-full rounded-md border border-border bg-white px-3 py-2 outline-none focus:border-gold"
                      placeholder="מטרת זמן / תחושה"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        <Save className="h-5 w-5" />
        {saving ? 'שומר...' : 'שמור פרופיל'}
      </Button>
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-muted">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-gold"
      />
    </label>
  )
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-muted">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-gold"
      />
    </label>
  )
}
