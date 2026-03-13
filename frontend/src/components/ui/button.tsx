import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-white text-black hover:bg-zinc-200 border border-transparent hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]',
        destructive:
          'bg-red-500/10 text-red-400 border border-red-500/30 hover:border-red-500/50 hover:shadow-[0_0_15px_hsla(350,100%,55%,0.3)]',
        outline:
          'border border-zinc-700/50 bg-transparent text-zinc-300 hover:bg-zinc-900 hover:border-primary/40 hover:text-white hover:shadow-[0_0_10px_hsla(185,100%,50%,0.2)]',
        secondary:
          'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700/50 hover:shadow-[0_0_10px_hsla(185,100%,50%,0.15)]',
        ghost:
          'border border-transparent text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200 hover:shadow-[0_0_8px_hsla(185,100%,50%,0.15)]',
        link:
          'text-zinc-400 underline-offset-4 hover:underline hover:text-zinc-200',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-lg px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
