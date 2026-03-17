import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { type Contact } from '@/lib/api'
import { useContacts } from '@/hooks/queries'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { InteractionForm } from '@/components/features/InteractionForm'
import { cn, getInitials, getAvatarColor } from '@/lib/utils'

interface QuickLogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickLogDialog({ open, onOpenChange }: QuickLogDialogProps) {
  const [search, setSearch] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  const { data: contacts = [] } = useContacts({ search: search || undefined })

  function handleClose() {
    onOpenChange(false)
    setSearch('')
    setSelectedContact(null)
  }

  function handleSuccess() {
    handleClose()
  }

  function handleSelectContact(contact: Contact) {
    setSelectedContact(contact)
    setSearch('')
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        {selectedContact ? (
          <>
            <button
              onClick={() => setSelectedContact(null)}
              className="absolute left-4 top-4 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            >
              ← back
            </button>
            <InteractionForm contact={selectedContact} onSuccess={handleSuccess} />
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="gradient-text-neon">Log Interaction</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <Input
                  className="pl-9"
                  placeholder="Search for a friend..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
                {search && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                    onClick={() => setSearch('')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {contacts.length > 0 && (
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {contacts.map((contact) => {
                    const initials = getInitials(contact.first_name, contact.last_name)
                    const colorClass = getAvatarColor(contact.first_name + (contact.last_name ?? ''))
                    const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ')
                    return (
                      <button
                        key={contact.id}
                        onClick={() => handleSelectContact(contact)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2.5',
                          'hover:border-[hsl(var(--border-hover))] hover:bg-[hsl(var(--card-elevated))] transition-colors text-left'
                        )}
                      >
                        <Avatar className="h-7 w-7 shrink-0">
                          {contact.photo_url && <AvatarImage src={contact.photo_url} alt={fullName} />}
                          <AvatarFallback className={cn('bg-gradient-to-br text-white text-[10px] font-medium', colorClass)}>
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{fullName}</p>
                          {contact.job_title && (
                            <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{contact.job_title}</p>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {search && contacts.length === 0 && (
                <p className="text-center text-sm text-[hsl(var(--muted-foreground))] py-6">
                  No friends found
                </p>
              )}

              {!search && contacts.length === 0 && (
                <p className="text-center text-sm text-[hsl(var(--muted-foreground))] py-6">
                  Start typing to find a friend
                </p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
