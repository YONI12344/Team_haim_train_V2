import { Crown } from 'lucide-react'
import Link from 'next/link'

export function BrandHeader() {
  return (
    <header className="bg-gradient-to-l from-navy-900 to-navy border-b border-gold/20 shadow-premium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/app" className="flex items-center gap-2">
            <Crown className="w-7 h-7 text-gold" />
            <span className="text-xl font-bold text-white">
              TEAM <span className="text-gold">HAIM</span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  )
}
