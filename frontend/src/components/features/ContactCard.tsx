import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react'
import { type Contact } from '@/lib/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, getInitials, getAvatarColor } from '@/lib/utils'

interface ContactCardProps {
  contact: Contact
  onLogInteraction?: (contact: Contact) => void
}

export function ContactCard({ contact, onLogInteraction }: ContactCardProps) {
  const initials = getInitials(contact.first_name, contact.last_name)
  const colorClass = getAvatarColor(contact.first_name + (contact.last_name ?? ''))
  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ')

  return (
    <div className="group rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 flex flex-col gap-4 transition-all duration-200 hover:border-[hsl(var(--border-hover))] hover:bg-[hsl(var(--card-elevated))] hover:shadow-lg">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12 shrink-0">
          {contact.photo_url && <AvatarImage src={contact.photo_url} alt={fullName} />}
          <AvatarFallback className={cn('bg-gradient-to-br text-white font-bold text-sm', colorClass)}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <Link
            to={`/contacts/${contact.id}`}
            className="font-semibold text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors line-clamp-1"
          >
            {fullName}
          </Link>
          {contact.nickname && (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">"{contact.nickname}"</p>
          )}
          {(contact.job_title || contact.company) && (
            <p className="text-xs text-[hsl(var(--foreground-muted))] truncate">
              {[contact.job_title, contact.company].filter(Boolean).join(' @ ')}
            </p>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1.5">
        {contact.email && (
          <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{contact.email}</span>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
            <Phone className="h-3 w-3 shrink-0" />
            <span>{contact.phone}</span>
          </div>
        )}
        {contact.location && (
          <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{contact.location}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {contact.tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border"
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

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-[hsl(var(--border))]">
        <div className="text-xs text-[hsl(var(--muted-foreground))]">
          {contact.last_contacted_at ? (
            <span>
              Last contact{' '}
              <span className="text-[hsl(var(--foreground-muted))]">
                {formatDistanceToNow(new Date(contact.last_contacted_at), { addSuffix: true })}
              </span>
            </span>
          ) : (
            <span className="text-[hsl(var(--warning))]">Never contacted</span>
          )}
        </div>
        {onLogInteraction && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault()
              onLogInteraction(contact)
            }}
          >
            <MessageCircle className="h-3 w-3" />
            Log
          </Button>
        )}
      </div>
    </div>
  )
}
