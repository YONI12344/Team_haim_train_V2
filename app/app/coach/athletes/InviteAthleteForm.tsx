'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/Button'

export function InviteAthleteForm() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)

    if (error) {
      toast.error('שגיאה בשליחת ההזמנה')
    } else {
      toast.success(`הזמנה נשלחה ל-${email}`)
      setEmail('')
    }
  }

  return (
    <form onSubmit={handleInvite} className="flex gap-3 flex-wrap">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="athlete@email.com"
        required
        dir="ltr"
        className="flex-1 min-w-[200px] border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-gold focus:border-transparent"
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'שולח...' : 'שלח הזמנה'}
      </Button>
    </form>
  )
}
