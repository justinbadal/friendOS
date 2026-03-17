import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { Button } from '@/components/ui/button'
import { QuickLogDialog } from '@/components/features/QuickLogDialog'

export function AppLayout() {
  const [quickLogOpen, setQuickLogOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-ambient">
        <Outlet />
      </main>

      {/* FAB */}
      <Button
        size="icon"
        className="fixed fab-safe-bottom right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:shadow-[0_0_30px_hsla(185,100%,50%,0.5)] transition-all duration-200"
        onClick={() => setQuickLogOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <QuickLogDialog open={quickLogOpen} onOpenChange={setQuickLogOpen} />
    </div>
  )
}
