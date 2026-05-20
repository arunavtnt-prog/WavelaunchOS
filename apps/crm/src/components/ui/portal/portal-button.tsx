import { cn } from '@/lib/utils'
import * as React from 'react'

export interface PortalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'pill' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
}

const PortalButton = React.forwardRef<HTMLButtonElement, PortalButtonProps>(
  ({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'font-medium transition-colors duration-200 inline-flex items-center justify-center',
          // Variants
          variant === 'primary' && 'bg-[#1713ed] hover:bg-[#100dbd] text-white',
          variant === 'secondary' && 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700',
          variant === 'pill' && 'px-4 py-1.5 rounded-full border border-gray-300 text-xs hover:bg-gray-200 bg-transparent text-black',
          variant === 'ghost' && 'hover:bg-gray-100 text-gray-600 hover:text-gray-900',
          // Sizes
          size === 'sm' && 'px-3 py-1.5 text-xs rounded-lg',
          size === 'default' && 'px-4 py-2 text-sm rounded-lg',
          size === 'lg' && 'px-6 py-3 text-base rounded-lg',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

PortalButton.displayName = 'PortalButton'

export { PortalButton }
