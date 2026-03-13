import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { contactsApi, tagsApi, type Contact, type ContactDetail } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

const schema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional().nullable(),
  nickname: z.string().optional().nullable(),
  email: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  birthday: z.string().optional().nullable(),
  how_we_met: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  job_title: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  contact_frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annually', 'never']),
  tag_ids: z.array(z.string()).optional(),
})

type FormValues = z.infer<typeof schema>

interface ContactFormProps {
  contact?: ContactDetail
  onSuccess?: () => void
}

export function ContactForm({ contact, onSuccess }: ContactFormProps) {
  const qc = useQueryClient()
  const isEditing = !!contact

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsApi.list(),
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: contact?.first_name ?? '',
      last_name: contact?.last_name ?? '',
      nickname: contact?.nickname ?? '',
      email: contact?.email ?? '',
      phone: contact?.phone ?? '',
      birthday: contact?.birthday ?? '',
      how_we_met: contact?.how_we_met ?? '',
      location: contact?.location ?? '',
      company: contact?.company ?? '',
      job_title: contact?.job_title ?? '',
      notes: contact?.notes ?? '',
      contact_frequency: contact?.contact_frequency ?? 'monthly',
      tag_ids: contact?.tags?.map((t) => t.id) ?? [],
    },
  })

  const mutation = useMutation({
    mutationFn: (data: FormValues) => {
      const payload = {
        ...data,
        email: data.email || null,
        last_name: data.last_name || null,
        nickname: data.nickname || null,
        phone: data.phone || null,
        birthday: data.birthday || null,
        how_we_met: data.how_we_met || null,
        location: data.location || null,
        company: data.company || null,
        job_title: data.job_title || null,
        notes: data.notes || null,
      }
      if (isEditing && contact) {
        return contactsApi.update(contact.id, payload)
      }
      return contactsApi.create(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contacts'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(isEditing ? 'Friend updated!' : 'Friend added!')
      onSuccess?.()
    },
    onError: (err) => {
      toast.error(`Error: ${err.message}`)
    },
  })

  const selectedTagIds: string[] = form.watch('tag_ids') ?? []

  const toggleTag = (tagId: string) => {
    const current = form.getValues('tag_ids') ?? []
    if (current.includes(tagId)) {
      form.setValue('tag_ids', current.filter((id) => id !== tagId))
    } else {
      form.setValue('tag_ids', [...current, tagId])
    }
  }

  return (
    <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      <DialogHeader>
        <DialogTitle className="gradient-text-neon">
          {isEditing ? 'Edit Friend' : 'Add a Friend'}
        </DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>First Name *</Label>
          <Input placeholder="Jane" {...form.register('first_name')} />
          {form.formState.errors.first_name && (
            <p className="text-xs text-[hsl(var(--destructive))]">
              {form.formState.errors.first_name.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Last Name</Label>
          <Input placeholder="Doe" {...form.register('last_name')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Nickname</Label>
          <Input placeholder="JD" {...form.register('nickname')} />
        </div>
        <div className="space-y-1.5">
          <Label>Birthday</Label>
          <Input type="date" {...form.register('birthday')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" placeholder="jane@example.com" {...form.register('email')} />
          {form.formState.errors.email && (
            <p className="text-xs text-[hsl(var(--destructive))]">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input placeholder="+1 555 0123" {...form.register('phone')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Company</Label>
          <Input placeholder="Acme Corp" {...form.register('company')} />
        </div>
        <div className="space-y-1.5">
          <Label>Job Title</Label>
          <Input placeholder="Engineer" {...form.register('job_title')} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Location</Label>
        <Input placeholder="New York, NY" {...form.register('location')} />
      </div>

      <div className="space-y-1.5">
        <Label>How we met</Label>
        <Input placeholder="At a conference, through a mutual friend..." {...form.register('how_we_met')} />
      </div>

      <div className="space-y-1.5">
        <Label>Check-in frequency</Label>
        <Select
          value={form.watch('contact_frequency')}
          onValueChange={(v) => form.setValue('contact_frequency', v as FormValues['contact_frequency'])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="annually">Annually</SelectItem>
            <SelectItem value="never">Never (don't remind me)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {tags.length > 0 && (
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const selected = selectedTagIds.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border transition-all"
                  style={{
                    color: selected ? tag.color : `${tag.color}80`,
                    borderColor: selected ? `${tag.color}60` : `${tag.color}25`,
                    backgroundColor: selected ? `${tag.color}20` : 'transparent',
                  }}
                >
                  {tag.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Textarea
          placeholder="Anything worth remembering..."
          rows={3}
          {...form.register('notes')}
        />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Friend'}
        </Button>
      </DialogFooter>
    </form>
  )
}
