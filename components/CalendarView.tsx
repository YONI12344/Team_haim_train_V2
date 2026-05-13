'use client'

/**
 * CalendarView – a Google Calendar-style weekly/monthly schedule viewer.
 *
 * Features:
 * - Week view (7 columns Sun–Sat) and Month view (6×7 grid)
 * - Top toolbar: Today, < >, current period label, Week/Month toggle
 * - Workout blocks with type colour-coding + green check when logged
 * - "+N more" overflow pill in month view
 * - Clicking a workout block navigates to the detail page
 * - Responsive: on mobile the week view becomes a vertical agenda
 */

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Workout, WorkoutType } from '@/lib/types'
import { WORKOUT_TYPE_LABELS } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// Colour map
// ─────────────────────────────────────────────────────────────────────────────
const TYPE_COLORS: Record<WorkoutType, string> = {
  Easy: 'bg-green-100 text-green-800 border-green-200',
  Tempo: 'bg-orange-100 text-orange-800 border-orange-200',
  Intervals: 'bg-red-100 text-red-800 border-red-200',
  'Long Run': 'bg-blue-100 text-blue-800 border-blue-200',
  Recovery: 'bg-teal-100 text-teal-800 border-teal-200',
  Strength: 'bg-purple-100 text-purple-800 border-purple-200',
  Race: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Rest: 'bg-gray-100 text-gray-600 border-gray-200',
}

const HEBREW_DAYS_SHORT = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']
const HEBREW_DAYS_FULL = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const HEBREW_MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function toISO(d: Date) {
  return d.toISOString().split('T')[0]
}

function isToday(d: Date) {
  return toISO(d) === toISO(new Date())
}

function startOfWeek(d: Date): Date {
  const copy = new Date(d)
  copy.setDate(d.getDate() - d.getDay()) // Sunday = 0
  copy.setHours(0, 0, 0, 0)
  return copy
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d)
  copy.setDate(d.getDate() + n)
  return copy
}

function addMonths(d: Date, n: number): Date {
  const copy = new Date(d)
  copy.setMonth(d.getMonth() + n)
  return copy
}

/** Returns an array of 42 (6 × 7) dates for the calendar grid */
function monthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const start = startOfWeek(first)
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

// ─────────────────────────────────────────────────────────────────────────────
// Small sub-components
// ─────────────────────────────────────────────────────────────────────────────
function WorkoutBlock({ workout, compact = false }: { workout: Workout; compact?: boolean }) {
  const type = workout.workout_type as WorkoutType
  const logged = workout.status === 'completed'
  return (
    <Link
      href={`/app/workouts/${workout.id}`}
      className={cn(
        'block rounded-lg border px-1.5 py-0.5 text-xs font-medium leading-tight transition-opacity hover:opacity-80',
        TYPE_COLORS[type],
        compact ? 'truncate' : '',
      )}
    >
      <div className="flex items-center gap-1">
        {logged && <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0" />}
        <span className="truncate">{compact ? (WORKOUT_TYPE_LABELS[type] || type) : (WORKOUT_TYPE_LABELS[type] || type)}</span>
        {!compact && workout.planned_distance_km && (
          <span className="text-[10px] opacity-70 shrink-0">{workout.planned_distance_km}ק״מ</span>
        )}
      </div>
    </Link>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
type View = 'week' | 'month'

interface CalendarViewProps {
  workouts: Workout[]
  /** If true, show the athlete's name on each workout (for coach view) */
  isCoach?: boolean
}

export function CalendarView({ workouts }: CalendarViewProps) {
  const today = new Date()
  const [view, setView] = useState<View>('week')
  const [cursor, setCursor] = useState<Date>(today)

  // Derive the range for the current view
  const weekStart = useMemo(() => startOfWeek(cursor), [cursor])
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  )
  const gridDates = useMemo(
    () => monthGrid(cursor.getFullYear(), cursor.getMonth()),
    [cursor],
  )

  // Workouts indexed by ISO date
  const byDate = useMemo(() => {
    const map: Record<string, Workout[]> = {}
    for (const w of workouts) {
      if (!map[w.workout_date]) map[w.workout_date] = []
      map[w.workout_date].push(w)
    }
    return map
  }, [workouts])

  // Navigation
  function goPrev() {
    if (view === 'week') setCursor(d => addDays(d, -7))
    else setCursor(d => addMonths(d, -1))
  }
  function goNext() {
    if (view === 'week') setCursor(d => addDays(d, 7))
    else setCursor(d => addMonths(d, 1))
  }
  function goToday() {
    setCursor(new Date())
  }

  // Current period label
  const periodLabel = useMemo(() => {
    if (view === 'week') {
      const end = weekDates[6]
      if (weekStart.getMonth() === end.getMonth()) {
        return `${HEBREW_MONTHS[weekStart.getMonth()]} ${weekStart.getFullYear()}`
      }
      return `${HEBREW_MONTHS[weekStart.getMonth()]}–${HEBREW_MONTHS[end.getMonth()]} ${end.getFullYear()}`
    }
    return `${HEBREW_MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`
  }, [view, cursor, weekStart, weekDates])

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        {/* Left: Today + arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="px-3 py-1.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            היום
          </button>
          <button
            onClick={goPrev}
            aria-label="תקופה קודמת"
            className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={goNext}
            aria-label="תקופה הבאה"
            className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm font-semibold text-gray-800 ml-1">{periodLabel}</span>
        </div>
        {/* Right: Week / Month toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {(['week', 'month'] as View[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                view === v ? 'bg-white shadow text-navy' : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {v === 'week' ? 'שבועי' : 'חודשי'}
            </button>
          ))}
        </div>
      </div>

      {view === 'week' ? (
        <WeekView weekDates={weekDates} byDate={byDate} />
      ) : (
        <MonthView gridDates={gridDates} byDate={byDate} currentMonth={cursor.getMonth()} />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Week View
// ─────────────────────────────────────────────────────────────────────────────
function WeekView({ weekDates, byDate }: { weekDates: Date[]; byDate: Record<string, Workout[]> }) {
  return (
    <>
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {weekDates.map((d, i) => {
          const today = isToday(d)
          return (
            <div key={toISO(d)} className="text-center py-3 px-1">
              <p className="text-xs font-medium text-gray-500 mb-1">{HEBREW_DAYS_FULL[i]}</p>
              <div className={cn(
                'inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold mx-auto',
                today ? 'bg-navy text-white' : 'text-gray-700',
              )}>
                {d.getDate()}
              </div>
            </div>
          )
        })}
      </div>

      {/* Workout cells */}
      <div className="grid grid-cols-7 divide-x divide-x-reverse divide-gray-100 min-h-[200px]">
        {weekDates.map((d) => {
          const dateStr = toISO(d)
          const dayWorkouts = byDate[dateStr] || []
          const today = isToday(d)
          return (
            <div
              key={dateStr}
              className={cn(
                'p-2 space-y-1 min-h-[120px]',
                today ? 'bg-blue-50/40' : '',
              )}
            >
              {dayWorkouts.map(w => (
                <WorkoutBlock key={w.id} workout={w} />
              ))}
              {dayWorkouts.length === 0 && (
                <p className="text-[10px] text-gray-300 text-center pt-4">—</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile agenda (visible only on small screens) */}
      <div className="sm:hidden divide-y divide-gray-100">
        {weekDates.map((d, i) => {
          const dateStr = toISO(d)
          const dayWorkouts = byDate[dateStr] || []
          return (
            <div key={dateStr} className="px-4 py-3">
              <p className={cn('text-xs font-semibold mb-2', isToday(d) ? 'text-navy' : 'text-gray-500')}>
                {HEBREW_DAYS_FULL[i]}, {d.getDate()} {HEBREW_MONTHS[d.getMonth()]}
              </p>
              {dayWorkouts.length === 0
                ? <p className="text-xs text-gray-300">אין אימון</p>
                : dayWorkouts.map(w => <WorkoutBlock key={w.id} workout={w} />)
              }
            </div>
          )
        })}
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Month View
// ─────────────────────────────────────────────────────────────────────────────
const MAX_VISIBLE = 3

function MonthView({
  gridDates,
  byDate,
  currentMonth,
}: {
  gridDates: Date[]
  byDate: Record<string, Workout[]>
  currentMonth: number
}) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <>
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {HEBREW_DAYS_SHORT.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
        ))}
      </div>

      {/* 6-row grid */}
      <div className="grid grid-cols-7 divide-x divide-x-reverse divide-gray-100">
        {gridDates.map(d => {
          const dateStr = toISO(d)
          const dayWorkouts = byDate[dateStr] || []
          const isCurrentMonth = d.getMonth() === currentMonth
          const today = isToday(d)
          const isExpanded = expanded === dateStr
          const overflow = dayWorkouts.length > MAX_VISIBLE
          const visible = isExpanded ? dayWorkouts : dayWorkouts.slice(0, MAX_VISIBLE)

          return (
            <div
              key={dateStr}
              className={cn(
                'min-h-[90px] p-1 border-b border-gray-100',
                !isCurrentMonth ? 'bg-gray-50' : '',
                today ? 'bg-blue-50/30' : '',
              )}
            >
              {/* Date number */}
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1 ml-auto',
                today ? 'bg-navy text-white' : isCurrentMonth ? 'text-gray-700' : 'text-gray-300',
              )}>
                {d.getDate()}
              </div>

              {/* Workouts */}
              <div className="space-y-0.5">
                {visible.map(w => (
                  <WorkoutBlock key={w.id} workout={w} compact />
                ))}
                {overflow && !isExpanded && (
                  <button
                    onClick={() => setExpanded(dateStr)}
                    className="text-[10px] text-navy font-medium hover:underline w-full text-right pr-0.5"
                  >
                    +{dayWorkouts.length - MAX_VISIBLE} עוד
                  </button>
                )}
                {isExpanded && (
                  <button
                    onClick={() => setExpanded(null)}
                    className="text-[10px] text-gray-400 hover:underline w-full text-right pr-0.5"
                  >
                    פחות
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
