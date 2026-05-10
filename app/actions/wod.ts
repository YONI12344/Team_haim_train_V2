'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function postWodComment(wodId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('לא מחובר')
  if (!content.trim()) throw new Error('ההערה ריקה')

  const { error } = await supabase.from('wod_comments').insert({
    wod_id: wodId,
    user_id: user.id,
    content: content.trim(),
  })

  if (error) throw new Error(error.message)

  revalidatePath('/app')
}
