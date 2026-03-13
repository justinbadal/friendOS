import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Users, MessageCircle, CalendarCheck, Bell, Phone, MessageSquare, Mail, Share2, MoreHorizontal } from 'lucide-react'
import { dashboardApi, type Contact, type RecentInteraction } from '@/lib/api'
import { StatsCard } from '@/components/features/StatsCard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { InteractionForm } from '@/components/features/InteractionForm'
import { cn } from '@/lib/utils'

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  text: MessageSquare,
  in_person: Users,
  email: Mail,
  social: Share2,
  other: MoreHorizontal,
}

const typeLabels: Record<string, string> = {
  call: 'Call',
  text: 'Text',
  in_person: 'In Person',
  email: 'Email',
  social: 'Social',
  other: 'Other',
}

function getInitials(first: string, last?: string | null) {
  return `${first[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase()
}

const avatarColors = [
  'from-zinc-700 to-zinc-800',
  'from-zinc-600 to-zinc-700',
  'from-zinc-700 to-zinc-900',
  'from-zinc-600 to-zinc-800',
  'from-zinc-500 to-zinc-700',
]

function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

export default function DashboardPage() {
  const [logContact, setLogContact] = useState<Contact | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.get,
    refetchInterval: 60_000,
  })

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-6 w-36 animate-shimmer rounded" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-shimmer rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8 text-sm text-zinc-500">
        Failed to load dashboard. Is the backend running?
      </div>
    )
  }

  const stats = data

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-white">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">Stay connected with the people who matter</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          label="Total Friends"
          value={stats.total_contacts}
          icon={Users}
          description={`+${stats.new_contacts_this_month} this month`}
        />
        <StatsCard
          label="Talked This Week"
          value={stats.interactions_this_week}
          icon={MessageCircle}
        />
        <StatsCard
          label="Talked This Month"
          value={stats.interactions_this_month}
          icon={CalendarCheck}
        />
        <StatsCard
          label="Need to Reach Out"
          value={stats.overdue_contacts.length}
          icon={Bell}
          description={stats.overdue_contacts.length === 0 ? "All caught up" : 'overdue check-ins'}
        />
      </div>

      {/* Friends */}
      {stats.recent_contacts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-400">Friends</h2>
            <Link to="/contacts" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              view all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {stats.recent_contacts.map((contact) => {
              const initials = getInitials(contact.first_name, contact.last_name)
              const colorClass = getAvatarColor(contact.first_name + (contact.last_name ?? ''))
              const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ')
              return (
                <Link
                  key={contact.id}
                  to={`/contacts/${contact.id}`}
                  className="flex items-center gap-2.5 rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-3 py-2.5 hover:border-zinc-700 hover:bg-zinc-900/50 transition-colors group"
                >
                  <Avatar className="h-7 w-7 shrink-0">
                    {contact.photo_url && <AvatarImage src={contact.photo_url} alt={fullName} />}
                    <AvatarFallback className={cn('bg-gradient-to-br text-white text-[10px] font-medium', colorClass)}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-200 group-hover:text-white transition-colors truncate">{fullName}</p>
                    {contact.last_contacted_at ? (
                      <p className="text-xs text-zinc-600 truncate">
                        {formatDistanceToNow(new Date(contact.last_contacted_at), { addSuffix: true })}
                      </p>
                    ) : (
                      <p className="text-xs text-zinc-700 truncate">never contacted</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Overdue contacts */}
        {stats.overdue_contacts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-400">Need to Reach Out</h2>
              <span className="text-xs text-zinc-500">{stats.overdue_contacts.length} overdue</span>
            </div>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {stats.overdue_contacts.map((contact) => {
                const initials = getInitials(contact.first_name, contact.last_name)
                const colorClass = getAvatarColor(contact.first_name + (contact.last_name ?? ''))
                const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ')
                return (
                  <div
                    key={contact.id}
                    className="flex items-center gap-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-3 py-2.5 hover:border-zinc-700 hover:bg-zinc-900/50 transition-colors"
                  >
                    <Avatar className="h-7 w-7 shrink-0">
                      {contact.photo_url && <AvatarImage src={contact.photo_url} alt={fullName} />}
                      <AvatarFallback className={cn('bg-gradient-to-br text-white text-[10px] font-medium', colorClass)}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/contacts/${contact.id}`}
                        className="text-sm text-zinc-200 hover:text-white transition-colors truncate block"
                      >
                        {fullName}
                      </Link>
                      <p className="text-xs text-zinc-500">
                        {contact.last_contacted_at
                          ? formatDistanceToNow(new Date(contact.last_contacted_at), { addSuffix: true })
                          : 'Never contacted'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs px-2 shrink-0"
                      onClick={() => setLogContact(contact)}
                    >
                      Reach out
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-400">Recent Activity</h2>
          {stats.recent_interactions.length === 0 ? (
            <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-8 text-center text-sm text-zinc-600">
              No interactions yet. Start connecting!
            </div>
          ) : (
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {stats.recent_interactions.map((interaction) => {
                const Icon = typeIcons[interaction.interaction_type] ?? MoreHorizontal
                const initials = getInitials(interaction.contact_first_name, interaction.contact_last_name)
                const colorClass = getAvatarColor(interaction.contact_first_name + (interaction.contact_last_name ?? ''))
                const fullName = [interaction.contact_first_name, interaction.contact_last_name].filter(Boolean).join(' ')
                return (
                  <div
                    key={interaction.id}
                    className="flex items-center gap-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-3 py-2.5 hover:border-zinc-700 hover:bg-zinc-900/50 transition-colors"
                  >
                    <Avatar className="h-7 w-7 shrink-0">
                      {interaction.contact_photo_url && (
                        <AvatarImage src={interaction.contact_photo_url} alt={fullName} />
                      )}
                      <AvatarFallback className={cn('bg-gradient-to-br text-white text-[10px] font-medium', colorClass)}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/contacts/${interaction.contact_id}`}
                          className="text-sm text-zinc-200 hover:text-white transition-colors"
                        >
                          {fullName}
                        </Link>
                        <span className="text-zinc-600">·</span>
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                          <Icon className="h-3 w-3" />
                          {typeLabels[interaction.interaction_type]}
                        </span>
                      </div>
                      {interaction.notes && (
                        <p className="text-xs text-zinc-600 truncate">{interaction.notes}</p>
                      )}
                    </div>
                    <span className="text-xs text-zinc-600 shrink-0">
                      {formatDistanceToNow(new Date(interaction.interacted_at), { addSuffix: true })}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

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
