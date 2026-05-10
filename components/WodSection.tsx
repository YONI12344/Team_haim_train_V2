import { Dumbbell } from 'lucide-react'
import WodComments from './WodComments'

interface Exercise {
  name: string
  detail: string
}

interface Comment {
  id: string
  content: string
  created_at: string
  profiles: { full_name: string | null } | null
}

interface Wod {
  id: string
  title: string
  description: string | null
  exercises: Exercise[]
  date: string
  wod_comments: Comment[]
}

interface Props {
  wod: Wod | null
}

export function WodSection({ wod }: Props) {
  if (!wod) {
    return (
      <div className="bg-white rounded-xl border border-gold/20 p-6 text-center shadow-sm">
        <Dumbbell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">אין אימון מתוכנן להיום</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gold/20 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-l from-navy-900 to-navy px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-gold" />
          <span className="text-white font-bold text-sm">אימון היום</span>
        </div>
        <span className="bg-gold/20 text-gold text-xs px-3 py-1 rounded-full font-semibold border border-gold/30">
          היום
        </span>
      </div>

      <div className="p-5">
        {/* Title + Description */}
        <h3 className="text-lg font-bold text-navy mb-1">{wod.title}</h3>
        {wod.description && (
          <p className="text-gray-500 text-sm mb-4 leading-relaxed">{wod.description}</p>
        )}

        {/* Exercises */}
        {wod.exercises.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              תרגילים
            </p>
            <div className="divide-y divide-gray-100">
              {wod.exercises.map((ex, i) => (
                <div key={i} className="flex items-center justify-between py-2.5">
                  <span className="text-navy font-medium text-sm">{ex.name}</span>
                  <span className="text-gray-500 text-sm font-medium">{ex.detail}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="border-t border-gray-100 pt-4">
          <WodComments
            wodId={wod.id}
            comments={wod.wod_comments}
          />
        </div>
      </div>
    </div>
  )
}
