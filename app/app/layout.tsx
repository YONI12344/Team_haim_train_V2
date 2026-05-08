import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Crown, LayoutDashboard, BarChart3, User, Users, LogOut } from 'lucide-react'
import Link from 'next/link'
import { getProfile } from '@/lib/auth'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profile = await getProfile()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top navbar */}
      <header className="bg-gradient-to-l from-navy-900 to-navy border-b border-gold/20 shadow-premium sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/app" className="flex items-center gap-2">
              <Crown className="w-7 h-7 text-gold" />
              <span className="text-xl font-bold text-white">
                TEAM <span className="text-gold">HAIM</span>
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <span className="text-gold-soft text-sm hidden sm:block">
                {profile?.full_name || user.email}
                {profile?.role === 'coach' && (
                  <span className="mr-2 text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full">מאמן</span>
                )}
              </span>
              <Link
                href="/api/auth/signout"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="התנתקות"
              >
                <LogOut className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-l border-gray-200 shadow-sm hidden md:flex flex-col sticky top-16 h-[calc(100vh-4rem)]">
          <nav className="flex-1 py-6 px-4 space-y-1">
            <NavLink href="/app" icon={<LayoutDashboard className="w-5 h-5" />} label="השבוע שלי" />
            <NavLink href="/app/stats" icon={<BarChart3 className="w-5 h-5" />} label="סטטיסטיקות" />
            <NavLink href="/app/profile" icon={<User className="w-5 h-5" />} label="פרופיל" />
            {profile?.role === 'coach' && (
              <>
                <div className="pt-4 pb-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase px-3">מאמן</p>
                </div>
                <NavLink href="/app/coach" icon={<LayoutDashboard className="w-5 h-5" />} label="דשבורד מאמן" />
                <NavLink href="/app/coach/athletes" icon={<Users className="w-5 h-5" />} label="ספורטאים" />
                <NavLink href="/app/coach/stats" icon={<BarChart3 className="w-5 h-5" />} label="סטטיסטיקות קבוצה" />
              </>
            )}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-navy/5 hover:text-navy transition-all duration-150 font-medium"
    >
      {icon}
      {label}
    </Link>
  )
}
