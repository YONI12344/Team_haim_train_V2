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
        'bg-white rounded-xl border border-border shadow-sm p-5 transition-shadow hover:shadow-md',
        goldBorder && 'border-gold/50',
        className
      )}
    >
      {children}
    </div>
  )
}
