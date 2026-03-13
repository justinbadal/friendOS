import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Shared avatar helpers ────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'from-[hsl(185,100%,40%)] to-[hsl(185,100%,25%)]',  // cyan
  'from-[hsl(315,100%,50%)] to-[hsl(315,100%,35%)]',  // magenta
  'from-[hsl(270,100%,55%)] to-[hsl(270,100%,40%)]',  // purple
  'from-[hsl(145,100%,40%)] to-[hsl(145,100%,25%)]',  // green
  'from-[hsl(45,100%,45%)]  to-[hsl(45,100%,30%)]',   // yellow
]

export function getInitials(first: string, last?: string | null) {
  return `${first[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase()
}

export function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
