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
        'bg-zinc-900/50 border border-zinc-800 rounded-xl p-6',
        'hover:border-zinc-600 hover:shadow-[0_0_20px_hsla(185,100%,50%,0.08)] transition-all duration-300 group',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-zinc-400">{label}</span>
        <Icon className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      </div>
      <div className="text-2xl font-medium text-white tabular-nums">{value}</div>
      {description && (
        <p className="text-xs text-zinc-500 mt-2">{description}</p>
      )}
    </div>
  )
}
