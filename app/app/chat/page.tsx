import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/auth'
import { ChatClient } from './ChatClient'

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ athlete?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfile()
  const isCoach = profile?.role === 'coach'

  const { data: athletes } = isCoach
    ? await supabase.from('profiles').select('*').eq('role', 'athlete').order('full_name')
    : { data: [] }

  const selectedAthleteId = isCoach ? params.athlete || athletes?.[0]?.id || null : user.id

  const { data: messages } = selectedAthleteId
    ? await supabase
        .from('messages')
        .select('*')
        .eq('athlete_id', selectedAthleteId)
        .order('created_at', { ascending: true })
    : { data: [] }

  return (
    <ChatClient
      currentUserId={user.id}
      profile={profile}
      athletes={athletes || []}
      selectedAthleteId={selectedAthleteId}
      messages={messages || []}
    />
  )
}
