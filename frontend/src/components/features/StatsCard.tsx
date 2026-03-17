import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  description?: string
  className?: string
}

export function StatsCard({ label, value, icon: Icon, description, className }: StatsCardProps) {
  return (
    <div
      className={cn(
        'bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6',
        'hover:border-[hsl(var(--border-hover))] hover:shadow-[0_0_20px_hsla(185,100%,50%,0.08)] transition-all duration-300 group',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{label}</span>
        <Icon className="h-4 w-4 text-[hsl(var(--foreground-subtle))] group-hover:text-[hsl(var(--muted-foreground))] transition-colors" />
      </div>
      <div className="text-2xl font-medium text-[hsl(var(--foreground))] tabular-nums">{value}</div>
      {description && (
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">{description}</p>
      )}
    </div>
  )
}
