import { useState } from 'react'
import { Plus, Trash2, Tag as TagIcon, Pencil } from 'lucide-react'
import { type Tag } from '@/lib/api'
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '@/hooks/queries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

const PRESET_COLORS = [
  '#00E5FF', '#FF33AA', '#9933FF', '#00FF7F', '#FFCC19',
  '#FF1A53', '#FF8C00', '#00BFFF', '#39FF14', '#FF6EC7',
]

interface TagFormProps {
  initial?: Tag
  onSave: (name: string, color: string) => void
  onClose: () => void
  loading?: boolean
}

function TagForm({ initial, onSave, onClose, loading }: TagFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [color, setColor] = useState(initial?.color ?? '#00E5FF')

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Tag Name</Label>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. college, NYC, close friend"
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: c,
                borderColor: color === c ? 'white' : 'transparent',
                boxShadow: color === c ? `0 0 8px ${c}` : undefined,
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <label className="text-xs text-[hsl(var(--muted-foreground))]">Custom:</label>
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            className="h-7 w-14 cursor-pointer rounded border border-[hsl(var(--border))] bg-transparent"
          />
          <span className="text-xs font-mono text-[hsl(var(--muted-foreground))]">{color}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Label className="text-sm">Preview:</Label>
        <Badge style={{ backgroundColor: color + '22', color, borderColor: color + '55', border: '1px solid' }}>
          {name || 'tag name'}
        </Badge>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          onClick={() => onSave(name.trim(), color)}
          disabled={!name.trim() || loading}
          className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:shadow-[0_0_15px_hsla(185,100%,50%,0.4)]"
        >
          {loading ? 'Saving…' : 'Save Tag'}
        </Button>
      </DialogFooter>
    </div>
  )
}

export default function TagsPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Tag | null>(null)
  const [deleting, setDeleting] = useState<Tag | null>(null)

  const { data: tags = [], isLoading } = useTags()
  const createMutation = useCreateTag(() => setShowCreate(false))
  const updateMutation = useUpdateTag(() => setEditing(null))
  const deleteMutation = useDeleteTag(() => setDeleting(null))

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold gradient-text-neon">Tags</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
            Organise your friends with colour-coded labels
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:shadow-[0_0_20px_hsla(185,100%,50%,0.4)] gap-2"
        >
          <Plus className="h-4 w-4" /> New Tag
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 rounded-lg animate-shimmer" />
          ))}
        </div>
      ) : tags.length === 0 ? (
        <Card className="border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <TagIcon className="h-12 w-12 text-[hsl(var(--muted-foreground))] mb-4" />
            <p className="text-[hsl(var(--muted-foreground))]">No tags yet</p>
            <p className="text-sm text-[hsl(var(--foreground-subtle))] mt-1">
              Create tags to organise your friends by group, location, or anything you like.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map(tag => (
            <Card
              key={tag.id}
              className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--border-hover))] transition-colors"
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: tag.color + '22', boxShadow: `0 0 8px ${tag.color}44` }}
                  >
                    <TagIcon className="h-4 w-4" style={{ color: tag.color }} />
                  </div>
                  <span className="font-medium text-[hsl(var(--foreground))]">{tag.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:text-[hsl(var(--primary))]"
                    onClick={() => setEditing(tag)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:text-[hsl(var(--destructive))]"
                    onClick={() => setDeleting(tag)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
          <DialogHeader>
            <DialogTitle className="gradient-text-neon">New Tag</DialogTitle>
          </DialogHeader>
          <TagForm
            onSave={(name, color) => createMutation.mutate({ name, color })}
            onClose={() => setShowCreate(false)}
            loading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={open => !open && setEditing(null)}>
        <DialogContent className="bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
          <DialogHeader>
            <DialogTitle className="gradient-text-neon">Edit Tag</DialogTitle>
          </DialogHeader>
          {editing && (
            <TagForm
              initial={editing}
              onSave={(name, color) => updateMutation.mutate({ id: editing.id, data: { name, color } })}
              onClose={() => setEditing(null)}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleting} onOpenChange={open => !open && setDeleting(null)}>
        <DialogContent className="max-w-sm">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Delete "{deleting?.name}"?</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                This will remove the tag from all contacts. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleting!.id)}
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
