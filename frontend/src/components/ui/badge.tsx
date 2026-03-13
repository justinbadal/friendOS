import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]',
  {
    variants: {
      variant: {
        default:
          'border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]',
        secondary:
          'border border-[hsl(var(--secondary)/0.3)] bg-[hsl(var(--secondary)/0.15)] text-[hsl(var(--secondary))]',
        destructive:
          'border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.15)] text-[hsl(var(--destructive))]',
        outline:
          'border border-[hsl(var(--border))] text-[hsl(var(--foreground-muted))]',
        success:
          'border border-[hsl(var(--success)/0.3)] bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]',
        warning:
          'border border-[hsl(var(--warning)/0.3)] bg-[hsl(var(--warning)/0.15)] text-[hsl(var(--warning))]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
