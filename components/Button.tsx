import { cn } from '@/lib/cn'
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed',
        variant === 'primary' && 'bg-navy text-white hover:bg-navy-800',
        variant === 'secondary' && 'bg-transparent border-2 border-gold text-gold hover:bg-gold hover:text-navy-900',
        variant === 'ghost' && 'bg-transparent text-navy hover:bg-navy/10',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-5 py-2.5 text-base',
        size === 'lg' && 'px-8 py-3.5 text-lg',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
