import { cn } from '@/lib/utils/cn'
import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-background-card border border-white/10',
      glass: 'glass-card',
      elevated: 'bg-background-elevated shadow-xl',
    }
    
    return (
      <div
        ref={ref}
        className={cn('rounded-xl p-6', variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card
