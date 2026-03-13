import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Tag, Heart, BookOpen, ChevronUp, LogOut, Puzzle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { clearTokens, getUserEmail, getUserName } from '@/lib/auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/contacts', label: 'Friends', icon: Users },
  { href: '/tags', label: 'Tags', icon: Tag },
  { href: '/plugins', label: 'Plugins', icon: Puzzle },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = getUserEmail()
  const name = getUserName()
  const displayName = name || email.split('@')[0] || 'you'
  const initial = displayName[0]?.toUpperCase() ?? 'U'

  function handleLogout() {
    clearTokens()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="flex h-screen w-64 flex-col bg-black border-r border-zinc-900">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-900">
        <Heart className="h-4 w-4 text-zinc-400 shrink-0" />
        <span className="text-sm font-medium text-zinc-200 tracking-wide">friendOS</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/dashboard'
              ? location.pathname === '/' || location.pathname === '/dashboard'
              : location.pathname.startsWith(href)
          return (
            <Link
              key={href}
              to={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 border',
                active
                  ? 'bg-zinc-900 text-white border-zinc-600 shadow-[0_0_12px_hsla(185,100%,50%,0.15),inset_0_0_12px_hsla(185,100%,50%,0.05)]'
                  : 'text-zinc-400 border-transparent hover:bg-zinc-900/50 hover:text-zinc-200 hover:border-zinc-700 hover:shadow-[0_0_8px_hsla(185,100%,50%,0.1)]'
              )}
            >
              <Icon className={cn('h-4 w-4 transition-colors', active ? 'text-white' : 'text-zinc-500')} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-zinc-900">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md border border-transparent hover:bg-zinc-900/50 hover:border-zinc-700 hover:shadow-[0_0_8px_hsla(185,100%,50%,0.1)] transition-all duration-200 group">
              <div className="h-7 w-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 text-xs font-medium text-zinc-300">
                {initial}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm text-zinc-200 truncate">{displayName}</p>
                <p className="text-xs text-zinc-600 truncate">{email || 'personal crm'}</p>
              </div>
              <ChevronUp className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="w-56 mb-1 bg-zinc-950 border-zinc-800"
          >
            <DropdownMenuLabel className="text-zinc-500 text-xs">{email || 'account'}</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem className="gap-3 text-zinc-300 focus:bg-zinc-900 focus:text-zinc-100 cursor-pointer" asChild>
              <Link to="/api-reference">
                <BookOpen className="h-4 w-4 text-zinc-500" />
                API Reference
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem
              className="gap-3 text-red-400 focus:bg-zinc-900 focus:text-red-300 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
