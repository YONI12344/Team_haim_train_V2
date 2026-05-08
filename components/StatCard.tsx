import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/cn'

interface StatCardProps {
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'neutral'
  unit?: string
  className?: string
}

export function StatCard({ label, value, trend, unit, className }: StatCardProps) {
  return (
    <div className={cn('bg-white rounded-2xl shadow-premium p-6', className)}>
      <p className="text-gray-500 text-sm font-medium mb-2">{label}</p>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-navy">{value}</span>
        {unit && <span className="text-gray-400 text-sm mb-1">{unit}</span>}
        {trend && (
          <span className={cn('mb-1', trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-400')}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : trend === 'down' ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
          </span>
        )}
      </div>
    </div>
  )
}
