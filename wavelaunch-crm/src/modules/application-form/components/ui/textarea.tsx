import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[140px] w-full rounded-none border-0 border-b border-white/15 bg-transparent px-0 py-4 text-[17px] font-normal text-foreground/90 placeholder:text-foreground/15 placeholder:font-light focus-visible:outline-none focus-visible:border-foreground/40 focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
