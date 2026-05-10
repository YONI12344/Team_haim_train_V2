'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronUp,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  User,
  Users,
  X,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Profile } from '@/lib/types'

type AppShellProps = {
  children: React.ReactNode
  profile: Profile | null
  email?: string | null
}

const athleteLinks = [
  { href: '/app', label: 'דשבורד', Icon: LayoutDashboard },
  { href: '/app/workouts', label: 'לוח שנה', Icon: CalendarDays },
  { href: '/app/stats', label: 'סטטיסטיקות', Icon: BarChart3 },
  { href: '/app/profile', label: 'פרופיל', Icon: User },
  { href: '/app/chat', label: 'צ׳אט', Icon: MessageCircle },
]

const coachLinks = [
  { href: '/app/coach', label: 'דשבורד', Icon: LayoutDashboard },
  { href: '/app/coach/athletes', label: 'ספורטאים', Icon: Users },
  { href: '/app/coach/stats', label: 'סטטיסטיקות', Icon: BarChart3 },
  { href: '/app/chat', label: 'צ׳אט', Icon: MessageCircle },
]

const pageTitles: Record<string, string> = {
  '/app': 'דשבורד',
  '/app/workouts': 'לוח שנה',
  '/app/stats': 'סטטיסטיקות',
  '/app/profile': 'פרופיל ספורטאי',
  '/app/chat': 'צ׳אט מאמן',
  '/app/coach': 'דשבורד מאמן',
  '/app/coach/athletes': 'ספורטאים',
  '/app/coach/stats': 'סטטיסטיקות קבוצה',
}

export function AppShell({ children, profile, email }: AppShellProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isCoach = profile?.role === 'coach'
  const links = isCoach ? coachLinks : athleteLinks
  const title = useMemo(() => {
    const match = Object.keys(pageTitles)
      .sort((a, b) => b.length - a.length)
      .find((path) => pathname === path || pathname.startsWith(`${path}/`))
    return match ? pageTitles[match] : 'Team Haim'
  }, [pathname])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 right-0 z-40 hidden w-60 flex-col bg-navy text-white shadow-premium lg:flex">
        <SidebarContent
          links={links}
          pathname={pathname}
          profile={profile}
          email={email}
        />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="סגור תפריט"
            className="absolute inset-0 bg-navy/45"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 flex w-72 max-w-[86vw] flex-col bg-navy text-white shadow-premium">
            <button
              onClick={() => setOpen(false)}
              className="absolute left-3 top-3 rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="סגור"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent
              links={links}
              pathname={pathname}
              profile={profile}
              email={email}
              onNavigate={() => setOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="lg:mr-60">
        <header className="sticky top-0 z-30 h-[60px] border-b border-border bg-white/88 backdrop-blur">
          <div className="flex h-full items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpen(true)}
                className="rounded-lg p-2 text-navy hover:bg-navy/5 lg:hidden"
                aria-label="פתח תפריט"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-extrabold text-navy">{title}</h1>
            </div>
            <button className="rounded-lg p-2 text-muted hover:bg-gold-soft hover:text-navy" aria-label="התראות">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="min-h-[calc(100vh-60px)] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 backdrop-blur lg:hidden">
        <div className="grid h-[60px]" style={{ gridTemplateColumns: `repeat(${Math.min(links.length, 5)}, minmax(0, 1fr))`, paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {links.slice(0, 5).map(({ href, label, Icon }) => {
            const active = href === '/app' ? pathname === '/app' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors',
                  active ? 'text-gold' : 'text-muted hover:text-navy'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

function SidebarContent({
  links,
  pathname,
  profile,
  email,
  onNavigate,
}: {
  links: typeof athleteLinks
  pathname: string
  profile: Profile | null
  email?: string | null
  onNavigate?: () => void
}) {
  const initials =
    profile?.full_name
      ?.split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2) ||
    email?.[0]?.toUpperCase() ||
    'T'

  return (
    <>
      <Link href="/app" onClick={onNavigate} className="flex h-[92px] items-center gap-3 px-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-900 text-gold ring-1 ring-gold/30">
          <ChevronUp className="h-7 w-7" />
        </span>
        <span className="text-xl font-extrabold tracking-wide text-gold">Team Haim</span>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {links.map(({ href, label, Icon }) => {
          const active = href === '/app' ? pathname === '/app' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg border-r-4 px-3 py-3 text-sm font-semibold transition-colors',
                active
                  ? 'border-gold bg-white/8 text-gold'
                  : 'border-transparent text-white/68 hover:bg-white/7 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-extrabold text-navy">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{profile?.full_name || email || 'Team Haim'}</p>
            <span className="mt-1 inline-flex rounded-md bg-white/10 px-2 py-0.5 text-xs font-semibold text-gold">
              {profile?.role === 'coach' ? 'מאמן' : 'כדורגל'}
            </span>
          </div>
        </div>
        <Link
          href="/api/auth/signout"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/12 px-3 py-2 text-sm font-semibold text-white/75 hover:bg-white/8 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          התנתקות
        </Link>
      </div>
    </>
  )
}
