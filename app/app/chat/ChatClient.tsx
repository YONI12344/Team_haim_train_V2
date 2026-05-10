'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import type { Message, Profile } from '@/lib/types'
import { MessageCircle, Send } from 'lucide-react'
import { cn } from '@/lib/cn'

type Props = {
  currentUserId: string
  profile: Profile | null
  athletes: Profile[]
  selectedAthleteId: string | null
  messages: Message[]
}

export function ChatClient({ currentUserId, profile, athletes, selectedAthleteId, messages }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const listRef = useRef<HTMLDivElement>(null)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const isCoach = profile?.role === 'coach'

  const selectedAthlete = useMemo(
    () => athletes.find((athlete) => athlete.id === selectedAthleteId),
    [athletes, selectedAthleteId]
  )

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages.length])

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault()
    if (!body.trim() || !selectedAthleteId) return
    setSending(true)
    const { error } = await supabase.from('messages').insert({
      athlete_id: selectedAthleteId,
      coach_id: isCoach ? currentUserId : null,
      sender_id: currentUserId,
      body: body.trim(),
    })
    setSending(false)
    if (error) {
      toast.error('שגיאה בשליחת הודעה')
      return
    }
    setBody('')
    router.refresh()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {isCoach && (
        <Card className="p-3">
          <h2 className="mb-3 px-2 text-sm font-bold text-muted">ספורטאים</h2>
          <div className="space-y-1">
            {athletes.length === 0 ? (
              <p className="px-2 py-8 text-center text-sm text-muted">אין ספורטאים עדיין</p>
            ) : (
              athletes.map((athlete) => (
                <Link
                  key={athlete.id}
                  href={`/app/chat?athlete=${athlete.id}`}
                  className={cn(
                    'block rounded-lg px-3 py-3 text-sm font-semibold transition-colors',
                    selectedAthleteId === athlete.id
                      ? 'bg-gold-soft text-navy'
                      : 'text-muted hover:bg-gray-50 hover:text-navy'
                  )}
                >
                  {athlete.full_name || 'ספורטאי'}
                </Link>
              ))
            )}
          </div>
        </Card>
      )}

      <Card className="flex min-h-[70vh] flex-col p-0">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-soft text-gold-dark">
            <MessageCircle className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold text-navy">
              {isCoach ? selectedAthlete?.full_name || 'בחר ספורטאי' : 'צ׳אט עם המאמן'}
            </h1>
            <p className="text-sm text-muted">אפשר לכתוב שאלות, עדכוני תחושה אחרי אימון ותיאום שינויים.</p>
          </div>
        </div>

        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full min-h-72 items-center justify-center text-center">
              <div>
                <MessageCircle className="mx-auto mb-3 h-10 w-10 text-gold" />
                <p className="font-bold text-navy">אין הודעות עדיין</p>
                <p className="text-sm text-muted">התחילו שיחה בין הספורטאי למאמן.</p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const mine = message.sender_id === currentUserId
              return (
                <div key={message.id} className={cn('flex', mine ? 'justify-start' : 'justify-end')}>
                  <div
                    className={cn(
                      'max-w-[82%] rounded-xl px-4 py-3 text-sm shadow-sm',
                      mine ? 'bg-navy text-white' : 'border border-border bg-gray-50 text-navy'
                    )}
                  >
                    <p className="whitespace-pre-wrap leading-6">{message.body}</p>
                    <p className={cn('mt-2 text-[11px]', mine ? 'text-white/55' : 'text-muted')}>
                      {new Date(message.created_at).toLocaleString('he-IL', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <form onSubmit={sendMessage} className="flex gap-2 border-t border-border p-4">
          <input
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="כתוב הודעה..."
            disabled={!selectedAthleteId}
            className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2 outline-none focus:border-gold"
          />
          <Button disabled={sending || !selectedAthleteId || !body.trim()} type="submit">
            <Send className="h-4 w-4" />
            שלח
          </Button>
        </form>
      </Card>
    </div>
  )
}
