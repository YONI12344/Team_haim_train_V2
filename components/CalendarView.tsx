'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Grid3X3 } from 'lucide-react'
import Link from 'next/link'
import { WorkoutPill } from './WorkoutPill'
import { WorkoutEditor } from './WorkoutEditor'
import type { Workout, WorkoutType, WorkoutStatus } from '@/lib/types'

const HEBREW_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const HEBREW_MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']

const STATUS_BG: Record<WorkoutStatus, string> = {
  planned: 'bg-blue-50 border-blue-200',
  in_progress: 'bg-orange-50 border-orange-200',
  completed: 'bg-green-50 border-green-200',
  missed: 'bg-red-50 border-red-200',
}

interface CalendarViewProps {
  workouts: Workout[]
  isCoach?: boolean
  athleteId?: string
}

export function CalendarView({ workouts, isCoach, athleteId }: CalendarViewProps) {
  const [view, setView] = useState<'week' | 'month'>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const getWeekDates = (date: Date) => {
    const start = new Date(date)
    const day = start.getDay()
    start.setDate(start.getDate() - day)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }

  const getMonthDates = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDay = firstDay.getDay()
    const dates: (Date | null)[] = []
    for (let i = 0; i < startDay; i++) dates.push(null)
    for (let d = 1; d <= lastDay.getDate(); d++) dates.push(new Date(year, month, d))
    return dates
  }

  const formatISO = (date: Date) => date.toISOString().split('T')[0]
  const getWorkoutsForDate = (date: Date) => workouts.filter(w => w.workout_date === formatISO(date))
  const isToday = (date: Date) => formatISO(date) === formatISO(today)
  const isPast = (date: Date) => date < today

  const navigate = (dir: number) => {
    const d = new Date(currentDate)
    if (view === 'week') d.setDate(d.getDate() + dir * 7)
    else d.setMonth(d.getMonth() + dir)
    setCurrentDate(d)
  }

  const weekDates = getWeekDates(currentDate)
  const monthDates = getMonthDates(currentDate)

  const handleSave = async (workout: { title: string; blocks: unknown[]; date: string }) => {
    try {
      await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...workout, athleteId }),
      })
      setSelectedDate(null)
      window.location.reload()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <>
      {selectedDate && (
        <WorkoutEditor
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
          onSave={handleSave}
        />
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ChevronRight className="w-5 h-5" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm bg-navy text-white rounded-lg hover:bg-navy/90 transition">
              היום
            </button>
            <button onClick={() => navigate(1)} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-navy mr-2">
              {view === 'month'
                ? `${HEBREW_MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                : `${weekDates[0].getDate()}–${weekDates[6].getDate()} ${HEBREW_MONTHS[weekDates[0].getMonth()]}`
              }
            </h2>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('week')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition ${view === 'week' ? 'bg-white shadow text-navy' : 'text-gray-500'}`}
            >
              <Grid3X3 className="w-4 h-4" /> שבוע
            </button>
            <button
              onClick={() => setView('month')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition ${view === 'month' ? 'bg-white shadow text-navy' : 'text-gray-500'}`}
            >
              <Calendar className="w-4 h-4" /> חודש
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {HEBREW_DAYS.map(day => (
            <div key={day} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase">
              {day}
            </div>
          ))}
        </div>

       {/* Week View */}
        {view === 'week' && (
          <div className="grid grid-cols-7 min-h-[300px]">
            {weekDates.map(date => {
              const dayWorkouts = getWorkoutsForDate(date)
              const past = isPast(date)
              return (
                <div
                  key={formatISO(date)}
                  className={`border-r border-gray-100 last:border-r-0 p-2 min-h-[200px] transition ${past ? 'bg-gray-50/50' : ''} ${isToday(date) ? 'bg-blue-50/30' : ''}`}
                >
                  <div className={`text-sm font-semibold mb-2 w-7 h-7 flex items-center justify-center rounded-full ${isToday(date) ? 'bg-gold text-white' : 'text-gray-600'}`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayWorkouts.map(w => (
                      <Link
                        key={w.id}
                        href={`/app/workouts/${w.id}`}
                        className={`block text-xs p-1.5 rounded-lg border ${STATUS_BG[w.status]} hover:opacity-80`}
                      >
                        <p className="font-medium text-navy mb-1">{w.workout_type}</p>
                        {w.planned_notes && (() => {
                          try {
                            const blocks = JSON.parse(w.planned_notes)
                            return (
                              <div className="space-y-0.5">
                                {blocks.map((b: {id: string; text: string}) => (
                                  b.text ? <p key={b.id} className="text-gray-600">{b.text}</p> : null
                                ))}
                              </div>
                            )
                          } catch { return null }
                        })()}
                        {w.planned_distance_km && <p className="text-gray-500 mt-1">{w.planned_distance_km} ק"מ</p>}
                        {w.status === 'completed' && (
                          <div className="mt-1.5 pt-1.5 border-t border-gray-200">
                            <p className="text-green-600 font-medium">הושלם ✓</p>
                            {w.actual_distance_km && <p className="text-gray-500">{w.actual_distance_km} ק"מ בפועל</p>}
                            {w.actual_pace && <p className="text-gray-500">טמפו: {w.actual_pace}</p>}
                            {w.athlete_notes && <p className="text-gray-500 italic">{w.athlete_notes}</p>}
                          </div>
                        )}
                      </Link>
                    ))}
                    {isCoach && (
                      <div
                        onClick={() => setSelectedDate(formatISO(date))}
                        className="text-xs text-gray-300 text-center pt-1 cursor-pointer hover:text-gray-500"
                      >
                        + הוסף
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Month View */}
        {view === 'month' && (
          <div className="grid grid-cols-7">
            {monthDates.map((date, i) => {
              if (!date) return <div key={i} className="border-r border-b border-gray-100 min-h-[100px]" />
              const dayWorkouts = getWorkoutsForDate(date)
              const past = isPast(date)
              return (
                <div
                  key={formatISO(date)}
                  className={`border-r border-b border-gray-100 p-1.5 min-h-[100px] transition ${past ? 'bg-gray-50/30' : ''} ${isToday(date) ? 'bg-blue-50/30' : ''}`}
                >
                  <div className={`text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday(date) ? 'bg-gold text-white' : 'text-gray-600'}`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-0.5">
                    {dayWorkouts.map(w => (
                      <Link
                        key={w.id}
                        href={`/app/workouts/${w.id}`}
                        className={`block text-xs px-1 py-0.5 rounded border ${STATUS_BG[w.status]} truncate hover:opacity-80`}
                      >
                        {w.workout_type}
                      </Link>
                    ))}
                  </div>
                  {isCoach && (
                    <div
                      onClick={() => setSelectedDate(formatISO(date))}
                      className="text-xs text-gray-300 text-center pt-1 cursor-pointer hover:text-gray-500"
                    >
                      + הוסף
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}