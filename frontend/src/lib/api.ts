import { getAccessToken, refreshTokens, clearTokens } from '@/lib/auth'

const BASE_URL = (import.meta.env.VITE_API_URL ?? '') + '/api/v1'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let token = getAccessToken()
  if (!token) {
    const refreshed = await refreshTokens()
    if (refreshed) token = getAccessToken()
  }
  if (!token) {
    clearTokens()
    window.location.href = '/login'
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
    ...options,
  })
  if (!res.ok) {
    const error = await res.text()
    throw new Error(error || `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContactFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'never'
export type InteractionType = 'call' | 'text' | 'in_person' | 'email' | 'social' | 'other'
export type Sentiment = 'great' | 'good' | 'neutral' | 'difficult'

export interface Tag {
  id: string
  name: string
  color: string
  created_at: string
}

export interface Interaction {
  id: string
  contact_id: string
  interacted_at: string
  interaction_type: InteractionType
  notes: string | null
  sentiment: Sentiment
  created_at: string
}

export interface Contact {
  id: string
  first_name: string
  last_name: string | null
  nickname: string | null
  email: string | null
  phone: string | null
  birthday: string | null
  how_we_met: string | null
  location: string | null
  company: string | null
  job_title: string | null
  notes: string | null
  photo_url: string | null
  contact_frequency: ContactFrequency
  last_contacted_at: string | null
  created_at: string
  updated_at: string
  tags: Tag[]
}

export interface ContactDetail extends Contact {
  interactions: Interaction[]
}

export interface RecentInteraction {
  id: string
  contact_id: string
  contact_first_name: string
  contact_last_name: string | null
  contact_photo_url: string | null
  interacted_at: string
  interaction_type: InteractionType
  notes: string | null
  sentiment: Sentiment
}

export interface DashboardStats {
  total_contacts: number
  interactions_this_week: number
  interactions_this_month: number
  new_contacts_this_month: number
  overdue_contacts: Contact[]
  recent_interactions: RecentInteraction[]
  recent_contacts: Contact[]
}

export interface ContactCreate {
  first_name: string
  last_name?: string | null
  nickname?: string | null
  email?: string | null
  phone?: string | null
  birthday?: string | null
  how_we_met?: string | null
  location?: string | null
  company?: string | null
  job_title?: string | null
  notes?: string | null
  photo_url?: string | null
  contact_frequency?: ContactFrequency
  last_contacted_at?: string | null
  tag_ids?: string[]
}

export interface InteractionCreate {
  contact_id: string
  interaction_type: InteractionType
  sentiment?: Sentiment
  notes?: string | null
  interacted_at?: string | null
}

export interface TagCreate {
  name: string
  color?: string
}

// ─── Contacts ─────────────────────────────────────────────────────────────────

export const contactsApi = {
  list: (params?: { search?: string; tag_id?: string }) => {
    const qs = new URLSearchParams()
    if (params?.search) qs.set('search', params.search)
    if (params?.tag_id) qs.set('tag_id', params.tag_id)
    const q = qs.toString()
    return request<Contact[]>(`/contacts${q ? `?${q}` : ''}`)
  },

  get: (id: string) => request<ContactDetail>(`/contacts/${id}`),

  create: (data: ContactCreate) =>
    request<ContactDetail>('/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<ContactCreate>) =>
    request<ContactDetail>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/contacts/${id}`, { method: 'DELETE' }),

  addTag: (contactId: string, tagId: string) =>
    request<Contact>(`/contacts/${contactId}/tags/${tagId}`, { method: 'POST' }),

  removeTag: (contactId: string, tagId: string) =>
    request<Contact>(`/contacts/${contactId}/tags/${tagId}`, { method: 'DELETE' }),
}

// ─── Interactions ─────────────────────────────────────────────────────────────

export const interactionsApi = {
  list: (contactId?: string) => {
    const qs = contactId ? `?contact_id=${contactId}` : ''
    return request<Interaction[]>(`/interactions${qs}`)
  },

  get: (id: string) => request<Interaction>(`/interactions/${id}`),

  create: (data: InteractionCreate) =>
    request<Interaction>('/interactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<InteractionCreate>) =>
    request<Interaction>(`/interactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/interactions/${id}`, { method: 'DELETE' }),
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export const tagsApi = {
  list: () => request<Tag[]>('/tags'),

  create: (data: TagCreate) =>
    request<Tag>('/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<TagCreate>) =>
    request<Tag>(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/tags/${id}`, { method: 'DELETE' }),
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const dashboardApi = {
  get: () => request<DashboardStats>('/dashboard'),
}
