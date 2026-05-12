'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function postWodComment(wodId: string, content: string) {
  // Verify the user is authenticated using the anon client
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) throw new Error('לא מחובר')
  if (!content.trim()) throw new Error('ההערה ריקה')

  // Use the service client to bypass RLS (user identity already verified above)
  const serviceClient = await createServiceClient()
  const { error } = await serviceClient.from('wod_comments').insert({
    wod_id: wodId,
    user_id: user.id,
    content: content.trim(),
  })

  if (error) throw new Error(error.message)

  revalidatePath('/app')
}
