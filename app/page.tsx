import Link from 'next/link'
import { Crown, Zap, Users, BarChart3, ChevronLeft } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-navy-900 via-navy to-navy-800 flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex items-center gap-3 mb-6">
          <Crown className="w-12 h-12 text-gold" />
          <h1 className="text-5xl font-bold text-white tracking-tight">
            TEAM <span className="text-gold">HAIM</span>
          </h1>
        </div>
        <p className="text-xl text-gold-soft mb-4 font-medium">מערכת אימונים מקצועית</p>
        <p className="text-gray-300 mb-10 max-w-md text-lg leading-relaxed">
          פלטפורמה מתקדמת לניהול תוכניות אימון, מעקב ביצועים, וצמיחה אתלטית
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-navy-900 font-bold px-8 py-4 rounded-2xl text-lg transition-all duration-200 shadow-premium hover:shadow-lg hover:-translate-y-0.5"
        >
          כניסה למערכת
          <ChevronLeft className="w-5 h-5" />
        </Link>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl w-full">
          {[
            { icon: Zap, title: 'תוכניות אישיות', desc: 'תוכניות אימון מותאמות אישית לכל ספורטאי' },
            { icon: BarChart3, title: 'מעקב ביצועים', desc: 'סטטיסטיקות מפורטות וגרפים בזמן אמת' },
            { icon: Users, title: 'ניהול קבוצה', desc: 'כלים מתקדמים למאמן לניהול כל הספורטאים' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-right">
              <Icon className="w-8 h-8 text-gold mb-3" />
              <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="text-center py-6 text-gray-500 text-sm">
        © 2025 Team Haim. כל הזכויות שמורות.
      </footer>
    </main>
  )
}
