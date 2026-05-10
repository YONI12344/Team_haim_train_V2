export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay() // 0 = Sunday
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })
}

export const HEBREW_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

export function formatHebrewDate(date: Date): string {
  return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })
}

export function formatPace(paceMinPerKm: number | null): string {
  if (!paceMinPerKm) return '—'
  const min = Math.floor(paceMinPerKm)
  const sec = Math.round((paceMinPerKm - min) * 60)
  return `${min}:${sec.toString().padStart(2, '0')} /ק"מ`
}

export function addWeeks(date: Date, weeks: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + weeks * 7)
  return d
}

export const WORKOUT_TYPE_LABELS: Record<string, string> = {
  Easy: 'ריצה קלה',
  Tempo: 'טמפו',
  Intervals: 'אינטרוולים',
  'Long Run': 'ריצה ארוכה',
  Recovery: 'התאוששות',
  Strength: 'כוח',
  Race: 'תחרות',
  Rest: 'מנוחה',
}

export const WORKOUT_STATUS_LABELS: Record<string, string> = {
  planned: 'מתוכנן',
  in_progress: 'בתהליך',
  completed: 'הושלם',
  missed: 'פוספס',
}
