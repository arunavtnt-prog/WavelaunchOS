import { cn } from '@/lib/utils'
import { MoreHorizontal } from 'lucide-react'
import * as React from 'react'

export interface PortalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'white'
  showMenu?: boolean
  onMenuClick?: () => void
}

const PortalCard = React.forwardRef<HTMLDivElement, PortalCardProps>(
  ({ className, variant = 'default', showMenu = false, onMenuClick, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative',
          // Default card style
          variant === 'default' && 'bg-gray-50 rounded-2xl p-6 border border-gray-100',
          // Primary card style (dark blue background)
          variant === 'primary' && 'bg-[#1713ed] text-white rounded-2xl p-6 relative overflow-hidden',
          // White card style
          variant === 'white' && 'bg-white rounded-2xl p-6 border border-gray-100 shadow-sm',
          className
        )}
        {...props}
      >
        {variant === 'primary' && (
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        )}
        {showMenu && (
          <button
            onClick={onMenuClick}
            className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        )}
        {children}
      </div>
    )
  }
)

PortalCard.displayName = 'PortalCard'

export { PortalCard }
