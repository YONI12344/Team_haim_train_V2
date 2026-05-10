'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BarChart3, User, Crown } from 'lucide-react'

interface Props {
  isCoach: boolean
}

export function MobileNav({ isCoach }: Props) {
  const pathname = usePathname()

  const tabs = [
    { href: '/app', label: 'השבוע שלי', Icon: LayoutDashboard },
    { href: '/app/stats', label: 'סטטיסטיקות', Icon: BarChart3 },
    ...(isCoach ? [{ href: '/app/coach', label: 'מאמן', Icon: Crown }] : []),
    { href: '/app/profile', label: 'פרופיל', Icon: User },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-navy border-t border-gold/20 z-50 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {tabs.map(({ href, label, Icon }) => {
          const isActive =
            href === '/app' ? pathname === '/app' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                isActive ? 'text-gold' : 'text-gray-400 active:text-gold-soft'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
