import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import {
  ArrowLeft, Edit2, Trash2, MessageCircle, Mail, Phone, MapPin,
  Calendar, Heart, Hash
} from 'lucide-react'
import { useContact, useDeleteContact } from '@/hooks/queries'
import { ContactForm } from '@/components/features/ContactForm'
import { InteractionForm } from '@/components/features/InteractionForm'
import { InteractionList } from '@/components/features/InteractionList'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { cn, getInitials, getAvatarColor } from '@/lib/utils'

const frequencyLabels: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annually: 'Annually',
  never: 'Never',
}


function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--muted))]">
        <Icon className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
      </div>
      <div>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{label}</p>
        <p className="text-sm text-[hsl(var(--foreground))]">{value}</p>
      </div>
    </div>
  )
}

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showLogDialog, setShowLogDialog] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data: contact, isLoading } = useContact(id)
  const deleteMutation = useDeleteContact(() => navigate('/contacts'))

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-40 animate-shimmer rounded-lg" />
        <div className="h-48 animate-shimmer rounded-xl" />
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="p-8 text-center">
        <p className="text-[hsl(var(--muted-foreground))]">Contact not found.</p>
        <Link to="/contacts" className="text-[hsl(var(--primary))] text-sm mt-2 inline-block">
          Back to friends
        </Link>
      </div>
    )
  }

  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ')
  const initials = getInitials(contact.first_name, contact.last_name)
  const colorClass = getAvatarColor(contact.first_name + (contact.last_name ?? ''))

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      {/* Back */}
      <Link
        to="/contacts"
        className="inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Friends
      </Link>

      {/* Profile Header */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <div className="flex items-start gap-5">
          <Avatar className="h-20 w-20 shrink-0">
            {contact.photo_url && <AvatarImage src={contact.photo_url} alt={fullName} />}
            <AvatarFallback className={cn('bg-gradient-to-br text-white text-2xl font-bold', colorClass)}>
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold gradient-text-neon">{fullName}</h1>
                {contact.nickname && (
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    "{contact.nickname}"
                  </p>
                )}
                {(contact.job_title || contact.company) && (
                  <p className="text-sm text-[hsl(var(--foreground-muted))] mt-1">
                    {[contact.job_title, contact.company].filter(Boolean).join(' at ')}
                  </p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => setShowEditDialog(true)}>
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button size="sm" onClick={() => setShowLogDialog(true)}>
                  <MessageCircle className="h-3.5 w-3.5" />
                  Log Interaction
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tags */}
            {contact.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {contact.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border"
                    style={{
                      color: tag.color,
                      borderColor: `${tag.color}40`,
                      backgroundColor: `${tag.color}15`,
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Check-in badge */}
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-1 text-xs text-[hsl(var(--muted-foreground))]">
              <Heart className="h-3 w-3" />
              Check in: <span className="font-medium capitalize">{frequencyLabels[contact.contact_frequency]}</span>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <Separator className="my-5" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {contact.email && <InfoRow icon={Mail} label="Email" value={contact.email} />}
          {contact.phone && <InfoRow icon={Phone} label="Phone" value={contact.phone} />}
          {contact.location && <InfoRow icon={MapPin} label="Location" value={contact.location} />}
          {contact.birthday && (
            <InfoRow
              icon={Calendar}
              label="Birthday"
              value={format(new Date(contact.birthday + 'T00:00:00'), 'MMMM d, yyyy')}
            />
          )}
          {contact.how_we_met && <InfoRow icon={Hash} label="How we met" value={contact.how_we_met} />}
          {contact.last_contacted_at && (
            <InfoRow
              icon={MessageCircle}
              label="Last contacted"
              value={format(new Date(contact.last_contacted_at), 'MMM d, yyyy')}
            />
          )}
        </div>

        {contact.notes && (
          <>
            <Separator className="my-5" />
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1.5">Notes</p>
              <p className="text-sm text-[hsl(var(--foreground-muted))] whitespace-pre-wrap">{contact.notes}</p>
            </div>
          </>
        )}
      </div>

      {/* Interaction history */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[hsl(var(--foreground))]">
            Interaction History
            <span className="ml-2 text-xs text-[hsl(var(--muted-foreground))] font-normal">
              ({contact.interactions.length})
            </span>
          </h2>
          <Button size="sm" variant="outline" onClick={() => setShowLogDialog(true)}>
            <MessageCircle className="h-3.5 w-3.5" />
            Log New
          </Button>
        </div>
        <InteractionList interactions={contact.interactions} contactId={contact.id} contact={contact} />
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <ContactForm contact={contact} onSuccess={() => setShowEditDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* Log Interaction Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="max-w-md">
          <InteractionForm contact={contact} onSuccess={() => setShowLogDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-sm">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Remove {fullName}?</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                This will permanently delete this contact and all their interactions. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate(id!)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Removing...' : 'Remove'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
