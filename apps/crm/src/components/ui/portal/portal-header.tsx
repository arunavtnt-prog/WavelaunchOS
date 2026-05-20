import { cn } from '@/lib/utils'
import * as React from 'react'

export interface PortalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  badge?: React.ReactNode
  action?: React.ReactNode
}

const PortalHeader = React.forwardRef<HTMLDivElement, PortalHeaderProps>(
  ({ className, title, description, badge, action, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col space-y-4 mb-8', className)} {...props}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {title && (
                <h1 className="text-3xl md:text-4xl font-normal tracking-tight font-display">
                  {title}
                </h1>
              )}
              {badge}
            </div>
            {description && (
              <p className="text-sm sm:text-base text-gray-500 max-w-2xl">
                {description}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
        {children}
      </div>
    )
  }
)

PortalHeader.displayName = 'PortalHeader'

export { PortalHeader }
