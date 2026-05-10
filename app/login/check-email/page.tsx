import Link from 'next/link'
import { Mail, Crown } from 'lucide-react'

export default function CheckEmailPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-navy-900 via-navy to-navy-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Crown className="w-10 h-10 text-gold" />
          <span className="text-3xl font-bold text-white">TEAM <span className="text-gold">HAIM</span></span>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-10 shadow-premium">
          <Mail className="w-16 h-16 text-gold mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-3">בדוק את המייל שלך ✉️</h1>
          <p className="text-gray-300 leading-relaxed mb-6">
            שלחנו לך קישור כניסה. לחץ על הקישור במייל כדי להיכנס למערכת.
          </p>
          <p className="text-gray-500 text-sm mb-6">לא קיבלת? בדוק את תיקיית הספאם.</p>
          <Link href="/login" className="text-gold hover:text-gold-dark text-sm font-medium transition-colors">
            ← חזרה לכניסה
          </Link>
        </div>
      </div>
    </main>
  )
}
