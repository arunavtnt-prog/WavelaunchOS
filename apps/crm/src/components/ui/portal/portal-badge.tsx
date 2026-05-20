import { cn } from '@/lib/utils'
import * as React from 'react'

export interface PortalBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'info' | 'outline'
  size?: 'sm' | 'default'
}

const PortalBadge = React.forwardRef<HTMLSpanElement, PortalBadgeProps>(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium',
          // Variants
          variant === 'default' && 'bg-[#1713ed] text-white',
          variant === 'success' && 'bg-green-100 text-green-800',
          variant === 'warning' && 'bg-yellow-100 text-yellow-800',
          variant === 'info' && 'bg-blue-100 text-blue-800',
          variant === 'outline' && 'border border-gray-300 text-gray-700 bg-transparent',
          // Sizes
          size === 'sm' && 'px-2 py-0.5 text-[10px] rounded-full',
          size === 'default' && 'px-2.5 py-1 text-xs rounded-full',
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

PortalBadge.displayName = 'PortalBadge'

export { PortalBadge }
