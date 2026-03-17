import { useState } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { Phone, MessageSquare, Users, Mail, Share2, MoreHorizontal, Trash2, Pencil, MessageCircle } from 'lucide-react'
import { type Interaction, type Contact } from '@/lib/api'
import { useDeleteInteraction } from '@/hooks/queries'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { InteractionForm } from '@/components/features/InteractionForm'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface InteractionListProps {
  interactions: Interaction[]
  contactId: string
  contact: Contact
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  text: MessageSquare,
  in_person: Users,
  email: Mail,
  social: Share2,
  other: MoreHorizontal,
}

const typeLabels: Record<string, string> = {
  call: 'Phone Call',
  text: 'Text / Chat',
  in_person: 'In Person',
  email: 'Email',
  social: 'Social Media',
  other: 'Other',
}

const sentimentStyles: Record<string, string> = {
  great: 'text-[hsl(var(--success))] border-[hsl(var(--success)/0.3)] bg-[hsl(var(--success)/0.1)]',
  good: 'text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.1)]',
  neutral: 'text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))] bg-[hsl(var(--muted))]',
  difficult: 'text-[hsl(var(--destructive))] border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.1)]',
}

export function InteractionList({ interactions, contactId, contact }: InteractionListProps) {
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null)
  const [deletingInteraction, setDeletingInteraction] = useState<Interaction | null>(null)
  const deleteMutation = useDeleteInteraction(contactId)

  if (interactions.length === 0) {
    return (
      <div className="py-12 text-center space-y-2">
        <MessageCircle className="h-8 w-8 text-[hsl(var(--foreground-subtle))] mx-auto" />
        <p className="text-sm text-[hsl(var(--muted-foreground))]">No interactions yet. Log your first one!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {interactions.map((interaction) => {
        const Icon = typeIcons[interaction.interaction_type] ?? MoreHorizontal
        const date = new Date(interaction.interacted_at)

        return (
          <div
            key={interaction.id}
            className="flex items-start gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 hover:border-[hsl(var(--border-hover))] hover:shadow-[0_0_20px_hsla(185,100%,50%,0.06)] transition-all duration-200 group"
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
              <Icon className="h-3.5 w-3.5 text-[hsl(var(--foreground-muted))]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {typeLabels[interaction.interaction_type]}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize',
                    sentimentStyles[interaction.sentiment]
                  )}
                >
                  {interaction.sentiment}
                </span>
              </div>
              {interaction.notes && (
                <p className="mt-1 text-sm text-[hsl(var(--foreground-muted))]">{interaction.notes}</p>
              )}
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                {format(date, 'MMM d, yyyy')} &middot;{' '}
                {formatDistanceToNow(date, { addSuffix: true })}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => setEditingInteraction(interaction)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-[hsl(var(--destructive))] focus:text-[hsl(var(--destructive))]"
                  onClick={() => setDeletingInteraction(interaction)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      })}

      {/* Edit Dialog */}
      <Dialog open={!!editingInteraction} onOpenChange={(open) => !open && setEditingInteraction(null)}>
        <DialogContent className="max-w-md">
          {editingInteraction && (
            <InteractionForm
              contact={contact}
              interaction={editingInteraction}
              onSuccess={() => setEditingInteraction(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deletingInteraction} onOpenChange={(open) => !open && setDeletingInteraction(null)}>
        <DialogContent className="max-w-sm">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Delete this interaction?</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeletingInteraction(null)}>Cancel</Button>
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  deleteMutation.mutate(deletingInteraction!.id)
                  setDeletingInteraction(null)
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
