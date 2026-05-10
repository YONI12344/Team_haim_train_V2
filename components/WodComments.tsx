'use client'

import { useState } from 'react'
import { postWodComment } from '@/app/actions/wod'
import { MessageCircle, Send } from 'lucide-react'

interface Comment {
  id: string
  content: string
  created_at: string
  profiles: { full_name: string | null } | null
}

interface Props {
  wodId: string
  comments: Comment[]
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'עכשיו'
  if (min < 60) return `לפני ${min} דק'`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `לפני ${hr} שע'`
  return new Date(dateStr).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' })
}

export default function WodComments({ wodId, comments }: Props) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePost() {
    if (!content.trim() || loading) return
    setLoading(true)
    setError('')
    try {
      await postWodComment(wodId, content.trim())
      setContent('')
    } catch (e: any) {
      setError(e.message || 'שגיאה בשמירת ההערה')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-4 h-4 text-gold" />
        <span className="text-sm font-semibold text-navy">
          {comments.length === 0 ? 'הגיבו על האימון' : `${comments.length} תגובות`}
        </span>
      </div>

      {comments.length > 0 && (
        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
          {comments.map((c) => (
            <div key={c.id} className="bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm font-semibold text-navy">
                  {c.profiles?.full_name || 'ספורטאי'}
                </span>
                <span className="text-xs text-gray-400">{timeAgo(c.created_at)}</span>
              </div>
              <p className="text-sm text-gray-600">{c.content}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handlePost()}
          placeholder="הוסף תגובה..."
          maxLength={500}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
        />
        <button
          onClick={handlePost}
          disabled={loading || !content.trim()}
          className="bg-navy text-white px-4 py-2.5 rounded-lg disabled:opacity-40 hover:bg-navy-800 transition-colors flex items-center gap-1.5 text-sm font-medium"
        >
          <Send className="w-4 h-4" />
          {loading ? '...' : 'שלח'}
        </button>
      </div>

      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
    </div>
  )
}
