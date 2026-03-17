import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Tag, Heart, BookOpen,
  ChevronUp, LogOut, Puzzle, ChevronsLeft, ChevronsRight,
} from 'lucide-react'
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

const COLLAPSED_KEY = 'friendos_sidebar_collapsed'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/contacts', label: 'Friends', icon: Users },
  { href: '/tags', label: 'Tags', icon: Tag },
  { href: '/plugins', label: 'Plugins', icon: Puzzle },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSED_KEY) === 'true'
  )
  const email = getUserEmail()
  const name = getUserName()
  const displayName = name || email.split('@')[0] || 'you'
  const initial = displayName[0]?.toUpperCase() ?? 'U'

  function toggle() {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem(COLLAPSED_KEY, String(next))
  }

  function handleLogout() {
    clearTokens()
    navigate('/login', { replace: true })
  }

  return (
    <aside className={cn(
      'flex h-[100dvh] shrink-0 flex-col bg-black border-r border-zinc-900 transition-all duration-200 ease-in-out overflow-hidden safe-area-bottom safe-area-top',
      collapsed ? 'w-14' : 'w-56',
    )}>
      {/* Logo */}
      <div className="flex h-12 items-center gap-2.5 border-b border-zinc-900 px-4">
        <Heart className="h-4 w-4 shrink-0 text-[hsl(var(--secondary))]" />
        {!collapsed && (
          <span className="text-sm font-medium text-zinc-200 tracking-wide whitespace-nowrap">friendOS</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5">
        <button
          onClick={toggle}
          className={cn(
            'flex items-center rounded-md border border-transparent text-zinc-600 hover:bg-zinc-900/50 hover:text-zinc-400 hover:border-zinc-700 transition-all duration-200 mb-1',
            collapsed ? 'w-full justify-center h-8' : 'w-full gap-2 px-3 py-1.5 text-xs'
          )}
        >
          {collapsed
            ? <ChevronsRight className="h-3.5 w-3.5" />
            : <><ChevronsLeft className="h-3.5 w-3.5" /><span>Collapse</span></>
          }
        </button>

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
                'flex items-center gap-3 rounded-md text-sm transition-all duration-200 border',
                collapsed ? 'justify-center h-9 px-0' : 'px-3 py-2',
                active
                  ? 'bg-zinc-900 text-white border-zinc-600 shadow-[0_0_12px_hsla(185,100%,50%,0.15),inset_0_0_12px_hsla(185,100%,50%,0.05)]'
                  : 'text-zinc-400 border-transparent hover:bg-zinc-900/50 hover:text-zinc-200 hover:border-zinc-700 hover:shadow-[0_0_8px_hsla(185,100%,50%,0.1)]'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0 transition-colors', active ? 'text-white' : 'text-zinc-500')} />
              {!collapsed && <span className="whitespace-nowrap">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: user */}
      <div className="p-2 border-t border-zinc-900 space-y-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              'w-full flex items-center rounded-md border border-transparent hover:bg-zinc-900/50 hover:border-zinc-700 hover:shadow-[0_0_8px_hsla(185,100%,50%,0.1)] transition-all duration-200 group',
              collapsed ? 'justify-center h-9' : 'gap-3 px-3 py-2'
            )}>
              <div className="h-7 w-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 text-xs font-medium text-zinc-300">
                {initial}
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm text-zinc-200 truncate">{displayName}</p>
                    <p className="text-xs text-zinc-600 truncate">{email || 'personal crm'}</p>
                  </div>
                  <ChevronUp className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56 mb-1 bg-zinc-950 border-zinc-800">
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
