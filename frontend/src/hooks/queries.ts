/**
 * Central query key registry and hooks.
 *
 * All data fetching and mutations go through here. Pages/components import
 * these hooks and never touch query keys or API functions directly.
 *
 * Key structure:
 *   ['contacts']                       — base; invalidating this busts everything contact-related
 *   ['contacts', 'list', params]       — contact list (with search/tag filters)
 *   ['contacts', 'detail', id]         — single contact + interactions
 *   ['tags']                           — tag list
 *   ['dashboard']                      — dashboard stats
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  contactsApi,
  interactionsApi,
  tagsApi,
  dashboardApi,
  type ContactCreate,
  type InteractionCreate,
  type TagCreate,
} from '@/lib/api'

// ─── Query keys ──────────────────────────────────────────────────────────────

export const QUERY_KEYS = {
  contacts: {
    all: () => ['contacts'] as const,
    list: (params?: { search?: string; tag_id?: string }) =>
      ['contacts', 'list', params ?? {}] as const,
    detail: (id: string) => ['contacts', 'detail', id] as const,
  },
  tags: {
    all: () => ['tags'] as const,
  },
  dashboard: {
    all: () => ['dashboard'] as const,
  },
}

// ─── Query hooks ─────────────────────────────────────────────────────────────

export function useContacts(params?: { search?: string; tag_id?: string }) {
  return useQuery({
    queryKey: QUERY_KEYS.contacts.list(params),
    queryFn: () => contactsApi.list(params),
  })
}

export function useContact(id: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.contacts.detail(id!),
    queryFn: () => contactsApi.get(id!),
    enabled: !!id,
  })
}

export function useTags() {
  return useQuery({
    queryKey: QUERY_KEYS.tags.all(),
    queryFn: tagsApi.list,
  })
}

export function useDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.all(),
    queryFn: dashboardApi.get,
    refetchInterval: 60_000,
  })
}

// ─── Contact mutations ────────────────────────────────────────────────────────

export function useCreateContact(onSuccess?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ContactCreate) => contactsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all() })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.all() })
      toast.success('Friend added!')
      onSuccess?.()
    },
    onError: (err: Error) => toast.error(`Error: ${err.message}`),
  })
}

export function useUpdateContact(id: string, onSuccess?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<ContactCreate>) => contactsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all() })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.all() })
      toast.success('Friend updated!')
      onSuccess?.()
    },
    onError: (err: Error) => toast.error(`Error: ${err.message}`),
  })
}

export function useDeleteContact(onSuccess?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => contactsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all() })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.all() })
      toast.success('Friend removed')
      onSuccess?.()
    },
    onError: () => toast.error('Failed to delete contact'),
  })
}

// ─── Interaction mutations ────────────────────────────────────────────────────

export function useCreateInteraction(contactId: string, onSuccess?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<InteractionCreate, 'contact_id'>) =>
      interactionsApi.create({ ...data, contact_id: contactId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all() })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.all() })
      toast.success('Interaction logged!')
      onSuccess?.()
    },
    onError: (err: Error) => toast.error(`Error: ${err.message}`),
  })
}

export function useUpdateInteraction(contactId: string, onSuccess?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InteractionCreate> }) =>
      interactionsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.contacts.detail(contactId) })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.all() })
      toast.success('Interaction updated')
      onSuccess?.()
    },
    onError: (err: Error) => toast.error(`Error: ${err.message}`),
  })
}

export function useDeleteInteraction(contactId: string, onSuccess?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => interactionsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.contacts.detail(contactId) })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.all() })
      toast.success('Interaction deleted')
      onSuccess?.()
    },
    onError: () => toast.error('Failed to delete interaction'),
  })
}

// ─── Tag mutations ────────────────────────────────────────────────────────────

export function useCreateTag(onSuccess?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: TagCreate) => tagsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tags.all() })
      toast.success('Tag created')
      onSuccess?.()
    },
    onError: () => toast.error('Failed to create tag'),
  })
}

export function useUpdateTag(onSuccess?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TagCreate> }) =>
      tagsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tags.all() })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all() })
      toast.success('Tag updated')
      onSuccess?.()
    },
    onError: () => toast.error('Failed to update tag'),
  })
}

export function useDeleteTag(onSuccess?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tagsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tags.all() })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all() })
      toast.success('Tag deleted')
      onSuccess?.()
    },
    onError: () => toast.error('Failed to delete tag'),
  })
}
