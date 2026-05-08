'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Crown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
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
      toast.error('שגיאה בשליחת הקישור. נסה שוב.')
    } else {
      router.push('/login/check-email')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-navy-900 via-navy to-navy-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-10 h-10 text-gold" />
            <span className="text-3xl font-bold text-white">TEAM <span className="text-gold">HAIM</span></span>
          </div>
          <h1 className="text-xl text-gold-soft font-medium">התחברות עם קישור מייל</h1>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-premium">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-gold-soft text-sm font-medium mb-2">
                כתובת מייל
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                dir="ltr"
                className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold-dark text-navy-900 font-bold py-3 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg"
            >
              {loading ? 'שולח...' : 'שלח לי קישור כניסה'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
