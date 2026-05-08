'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import type { Profile } from '@/lib/types'

interface Props { profile: Profile; email: string }

type FormState = {
  full_name: string
  phone: string
  group_name: string
}

export function ProfileClient({ profile, email }: Props) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>({
    full_name: profile.full_name || '',
    phone: profile.phone || '',
    group_name: profile.group_name || '',
  })

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update(form)
      .eq('id', profile.id)
    setSaving(false)
    if (error) toast.error('שגיאה בשמירה')
    else toast.success('הפרופיל עודכן!')
  }

  const fields: { key: keyof FormState; label: string }[] = [
    { key: 'full_name', label: 'שם מלא' },
    { key: 'phone', label: 'טלפון' },
    { key: 'group_name', label: 'קבוצה' },
  ]

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-navy mb-6">הפרופיל שלי</h1>
      <Card>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">מייל</label>
            <input value={email} disabled dir="ltr" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 text-gray-500" />
          </div>
          {fields.map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
              <input
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-gold focus:border-transparent"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">תפקיד</label>
            <input value={profile.role === 'coach' ? 'מאמן' : 'ספורטאי/ת'} disabled className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 text-gray-500" />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full mt-2">
            {saving ? 'שומר...' : 'שמור שינויים'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
