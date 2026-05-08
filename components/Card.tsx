import { cn } from '@/lib/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  goldBorder?: boolean
}

export function Card({ children, className, goldBorder = false }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-premium p-6',
        goldBorder && 'border border-gold/30',
        className
      )}
    >
      {children}
    </div>
  )
}
