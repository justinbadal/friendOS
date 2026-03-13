import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, X } from 'lucide-react'
import { contactsApi, tagsApi, type Contact } from '@/lib/api'
import { ContactCard } from '@/components/features/ContactCard'
import { ContactForm } from '@/components/features/ContactForm'
import { InteractionForm } from '@/components/features/InteractionForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export default function ContactsPage() {
  const [search, setSearch] = useState('')
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [logContact, setLogContact] = useState<Contact | null>(null)

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts', search, selectedTagId],
    queryFn: () => contactsApi.list({ search: search || undefined, tag_id: selectedTagId || undefined }),
  })

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.list,
  })

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Friends</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            {contacts.length} {contacts.length === 1 ? 'friend' : 'friends'} in your circle
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4" />
          Add Friend
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <Input
            className="pl-9"
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

        {/* Tag filters */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTagId(null)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                selectedTagId === null
                  ? 'border-[hsl(var(--primary)/0.5)] bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]'
                  : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--border-hover))]'
              )}
            >
              All
            </button>
            {tags.map((tag) => {
              const selected = selectedTagId === tag.id
              return (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTagId(selected ? null : tag.id)}
                  className="rounded-full border px-3 py-1 text-xs font-medium transition-all"
                  style={{
                    color: selected ? tag.color : `${tag.color}80`,
                    borderColor: selected ? `${tag.color}60` : `${tag.color}30`,
                    backgroundColor: selected ? `${tag.color}20` : 'transparent',
                  }}
                >
                  {tag.name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 animate-shimmer rounded-xl" />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-16 text-center space-y-3">
          <p className="text-[hsl(var(--muted-foreground))]">
            {search || selectedTagId ? 'No friends match your filters.' : "You haven't added any friends yet."}
          </p>
          {!search && !selectedTagId && (
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4" />
              Add your first friend
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onLogInteraction={setLogContact}
            />
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <ContactForm onSuccess={() => setShowAddDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* Log Interaction Dialog */}
      <Dialog open={!!logContact} onOpenChange={(open) => !open && setLogContact(null)}>
        <DialogContent className="max-w-md">
          {logContact && (
            <InteractionForm contact={logContact} onSuccess={() => setLogContact(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
