import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { type Contact, type Interaction } from '@/lib/api'
import { useCreateInteraction, useUpdateInteraction } from '@/hooks/queries'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

const schema = z.object({
  interaction_type: z.enum(['call', 'text', 'in_person', 'email', 'social', 'other']),
  sentiment: z.enum(['great', 'good', 'neutral', 'difficult']),
  notes: z.string().optional().nullable(),
  interacted_at: z.string().optional().nullable(),
})

type FormValues = z.infer<typeof schema>

interface InteractionFormProps {
  contact: Contact
  interaction?: Interaction
  onSuccess?: () => void
}

const typeLabels: Record<string, string> = {
  call: 'Phone Call',
  text: 'Text / Chat',
  in_person: 'In Person',
  email: 'Email',
  social: 'Social Media',
  other: 'Other',
}

const sentimentLabels: Record<string, string> = {
  great: 'Great',
  good: 'Good',
  neutral: 'Neutral',
  difficult: 'Difficult',
}

const sentimentEmoji: Record<string, string> = {
  great: '',
  good: '',
  neutral: '',
  difficult: '',
}

export function InteractionForm({ contact, interaction, onSuccess }: InteractionFormProps) {
  const isEditing = !!interaction
  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ')

  const createMutation = useCreateInteraction(contact.id, onSuccess)
  const updateMutation = useUpdateInteraction(contact.id, onSuccess)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      interaction_type: interaction?.interaction_type ?? 'call',
      sentiment: interaction?.sentiment ?? 'good',
      notes: interaction?.notes ?? '',
      interacted_at: interaction?.interacted_at ?? null,
    },
  })

  function onSubmit(data: FormValues) {
    const payload = {
      interaction_type: data.interaction_type,
      sentiment: data.sentiment,
      notes: data.notes || null,
      interacted_at: data.interacted_at || null,
    }
    if (isEditing) {
      updateMutation.mutate({ id: interaction.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const mutation = isEditing ? updateMutation : createMutation

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <DialogHeader>
        <DialogTitle className="gradient-text-neon">{isEditing ? 'Edit Interaction' : 'Log Interaction'}</DialogTitle>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {isEditing
            ? <>Editing interaction with <span className="text-[hsl(var(--foreground))] font-medium">{fullName}</span></>
            : <>How did things go with <span className="text-[hsl(var(--foreground))] font-medium">{fullName}</span>?</>
          }
        </p>
      </DialogHeader>

      <div className="space-y-1.5">
        <Label>Type</Label>
        <Select
          value={form.watch('interaction_type')}
          onValueChange={(v) => form.setValue('interaction_type', v as FormValues['interaction_type'])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(typeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>How did it go?</Label>
        <div className="grid grid-cols-4 gap-2">
          {(['great', 'good', 'neutral', 'difficult'] as const).map((s) => {
            const selected = form.watch('sentiment') === s
            const colors: Record<string, string> = {
              great: 'hsl(var(--success))',
              good: 'hsl(var(--primary))',
              neutral: 'hsl(var(--muted-foreground))',
              difficult: 'hsl(var(--destructive))',
            }
            return (
              <button
                key={s}
                type="button"
                onClick={() => form.setValue('sentiment', s)}
                className="rounded-lg border px-3 py-2 text-xs font-medium transition-all"
                style={{
                  borderColor: selected ? `${colors[s]}60` : 'hsl(var(--border))',
                  backgroundColor: selected ? `${colors[s]}15` : 'transparent',
                  color: selected ? colors[s] : 'hsl(var(--muted-foreground))',
                }}
              >
                {sentimentLabels[s]}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Textarea
          placeholder="What did you talk about? Anything notable..."
          rows={3}
          {...form.register('notes')}
        />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Log Interaction'}
        </Button>
      </DialogFooter>
    </form>
  )
}
