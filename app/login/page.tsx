import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GoogleSignIn from '@/components/google-sign-in'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) redirect('/app')

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500 mb-6">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Athlete</h1>
            <p className="text-gray-500 mt-2 text-sm">Track every rep. Own every day.</p>
          </div>

          {params.error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3 mb-6">
              <p className="text-red-400 text-sm text-center">Sign in failed. Please try again.</p>
            </div>
          )}

          <GoogleSignIn />

          <p className="text-gray-700 text-xs text-center mt-6 leading-relaxed">
            By continuing you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
