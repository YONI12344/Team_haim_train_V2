import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/cn'

interface StatCardProps {
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'neutral'
  unit?: string
  className?: string
  icon?: React.ReactNode
}

export function StatCard({ label, value, trend, unit, className, icon }: StatCardProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md', className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-muted">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-soft text-gold-dark">
          {icon || <Activity className="h-5 w-5" />}
        </span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-extrabold text-navy">{value}</span>
        {unit && <span className="mb-1 text-sm font-medium text-muted">{unit}</span>}
      </div>
      {trend && (
        <div className={cn('mt-3 inline-flex items-center gap-1 text-xs font-semibold', trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-muted')}>
          {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : trend === 'down' ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
          לעומת שבוע שעבר
        </div>
      )}
    </div>
  )
}
