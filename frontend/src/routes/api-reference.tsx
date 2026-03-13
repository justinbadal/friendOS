import { useState } from 'react'
import { ChevronDown, ChevronRight, Copy, Check, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

function generateMarkdown(): string {
  const lines: string[] = [
    '# friendOS API Reference',
    '',
    '**Base URL:** `https://friends.servrar.net/api/v1`',
    '',
    '## Authentication',
    '',
    '| Method | Header |',
    '|--------|--------|',
    '| Bearer JWT | `Authorization: Bearer <oidc-access-token>` |',
    '| API Key | `X-API-Key: <your-key>` |',
    '',
  ]

  for (const group of API_GROUPS) {
    lines.push(`## ${group.tag.charAt(0).toUpperCase() + group.tag.slice(1)}`)
    lines.push('')

    for (const ep of group.endpoints) {
      const fullPath = `${BASE}${ep.path}`
      lines.push(`### \`${ep.method} ${fullPath}\``)
      lines.push('')
      lines.push(ep.description)
      lines.push('')

      if (ep.queryParams?.length) {
        lines.push('**Query Parameters**')
        lines.push('')
        lines.push('| Name | Type | Description |')
        lines.push('|------|------|-------------|')
        for (const p of ep.queryParams) {
          lines.push(`| \`${p.name}\` | ${p.type} | ${p.description} |`)
        }
        lines.push('')
      }

      if (ep.body?.length) {
        lines.push('**Request Body (JSON)**')
        lines.push('')
        lines.push('| Name | Type | Required | Description |')
        lines.push('|------|------|----------|-------------|')
        for (const p of ep.body) {
          lines.push(`| \`${p.name}\` | ${p.type} | ${p.required ? 'yes' : 'no'} | ${p.description} |`)
        }
        lines.push('')
      }

      lines.push(`**Returns:** \`${ep.returns}\``)
      lines.push('')
      lines.push('**Example**')
      lines.push('')
      const curlBody = (ep.method === 'POST' || ep.method === 'PUT') ? " -H \"Content-Type: application/json\" -d '{}'" : ''
      lines.push('```bash')
      lines.push(`curl -X ${ep.method} https://friends.servrar.net${fullPath} \\`)
      lines.push(`  -H "X-API-Key: <your-key>"${curlBody}`)
      lines.push('```')
      lines.push('')
    }
  }

  return lines.join('\n')
}

const BASE = '/api/v1'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface Param {
  name: string
  type: string
  required?: boolean
  description: string
}

interface Endpoint {
  method: Method
  path: string
  description: string
  queryParams?: Param[]
  body?: Param[]
  returns: string
}

interface Group {
  tag: string
  endpoints: Endpoint[]
}

const API_GROUPS: Group[] = [
  {
    tag: 'contacts',
    endpoints: [
      {
        method: 'GET',
        path: '/contacts',
        description: 'List all contacts, optionally filtered by search term or tag.',
        queryParams: [
          { name: 'search', type: 'string', description: 'Filter by name, nickname, email, or company' },
          { name: 'tag_id', type: 'string', description: 'Filter by tag UUID' },
        ],
        returns: 'ContactRead[]',
      },
      {
        method: 'POST',
        path: '/contacts',
        description: 'Create a new contact.',
        body: [
          { name: 'first_name', type: 'string', required: true, description: 'First name' },
          { name: 'last_name', type: 'string', description: 'Last name' },
          { name: 'nickname', type: 'string', description: 'Nickname' },
          { name: 'email', type: 'string', description: 'Email address' },
          { name: 'phone', type: 'string', description: 'Phone number' },
          { name: 'birthday', type: 'date', description: 'Birthday (YYYY-MM-DD)' },
          { name: 'how_we_met', type: 'string', description: 'How you met' },
          { name: 'location', type: 'string', description: 'City / location' },
          { name: 'company', type: 'string', description: 'Employer / company' },
          { name: 'job_title', type: 'string', description: 'Job title' },
          { name: 'notes', type: 'string', description: 'Free-form notes' },
          { name: 'photo_url', type: 'string', description: 'Avatar image URL' },
          { name: 'contact_frequency', type: 'enum', description: 'daily | weekly | monthly | quarterly | annually | never' },
          { name: 'tag_ids', type: 'string[]', description: 'Tag UUIDs to attach' },
        ],
        returns: 'ContactReadDetail (201)',
      },
      {
        method: 'GET',
        path: '/contacts/:id',
        description: 'Get a single contact with full interaction history.',
        returns: 'ContactReadDetail',
      },
      {
        method: 'PUT',
        path: '/contacts/:id',
        description: 'Update a contact. All fields are optional.',
        body: [
          { name: '(same fields as POST)', type: '', description: 'Any subset of contact fields' },
        ],
        returns: 'ContactReadDetail',
      },
      {
        method: 'DELETE',
        path: '/contacts/:id',
        description: 'Delete a contact and all their interactions.',
        returns: '204 No Content',
      },
      {
        method: 'POST',
        path: '/contacts/:id/tags/:tag_id',
        description: 'Add a tag to a contact.',
        returns: 'ContactRead',
      },
      {
        method: 'DELETE',
        path: '/contacts/:id/tags/:tag_id',
        description: 'Remove a tag from a contact.',
        returns: 'ContactRead',
      },
    ],
  },
  {
    tag: 'interactions',
    endpoints: [
      {
        method: 'GET',
        path: '/interactions',
        description: 'List interactions, optionally filtered by contact.',
        queryParams: [
          { name: 'contact_id', type: 'string', description: 'Filter to a specific contact UUID' },
        ],
        returns: 'InteractionRead[]',
      },
      {
        method: 'POST',
        path: '/interactions',
        description: "Log a new interaction. Automatically updates the contact's last_contacted_at.",
        body: [
          { name: 'contact_id', type: 'string', required: true, description: 'Contact UUID' },
          { name: 'interaction_type', type: 'enum', required: true, description: 'call | text | in_person | email | social | other' },
          { name: 'interacted_at', type: 'datetime', description: 'ISO 8601 timestamp (defaults to now)' },
          { name: 'notes', type: 'string', description: 'Notes from the interaction' },
          { name: 'sentiment', type: 'enum', description: 'positive | neutral | negative' },
        ],
        returns: 'InteractionRead (201)',
      },
      {
        method: 'GET',
        path: '/interactions/:id',
        description: 'Get a single interaction.',
        returns: 'InteractionRead',
      },
      {
        method: 'PUT',
        path: '/interactions/:id',
        description: 'Update an interaction.',
        body: [
          { name: '(same fields as POST)', type: '', description: 'Any subset of interaction fields' },
        ],
        returns: 'InteractionRead',
      },
      {
        method: 'DELETE',
        path: '/interactions/:id',
        description: 'Delete an interaction.',
        returns: '204 No Content',
      },
    ],
  },
  {
    tag: 'tags',
    endpoints: [
      {
        method: 'GET',
        path: '/tags',
        description: 'List all tags.',
        returns: 'TagRead[]',
      },
      {
        method: 'POST',
        path: '/tags',
        description: 'Create a tag.',
        body: [
          { name: 'name', type: 'string', required: true, description: 'Tag name' },
          { name: 'color', type: 'string', description: 'Hex color (e.g. #00d4ff)' },
        ],
        returns: 'TagRead (201)',
      },
      {
        method: 'PUT',
        path: '/tags/:id',
        description: 'Update a tag.',
        body: [
          { name: 'name', type: 'string', description: 'New name' },
          { name: 'color', type: 'string', description: 'New hex color' },
        ],
        returns: 'TagRead',
      },
      {
        method: 'DELETE',
        path: '/tags/:id',
        description: 'Delete a tag.',
        returns: '204 No Content',
      },
    ],
  },
  {
    tag: 'dashboard',
    endpoints: [
      {
        method: 'GET',
        path: '/dashboard',
        description: 'Get dashboard stats: total contacts, interactions this week/month, overdue contacts, recent interactions, and recently added contacts.',
        returns: 'DashboardStats',
      },
    ],
  },
]

const METHOD_COLORS: Record<Method, string> = {
  GET:    'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  POST:   'text-cyan-400   bg-cyan-400/10   border-cyan-400/20',
  PUT:    'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  DELETE: 'text-red-400    bg-red-400/10    border-red-400/20',
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={copy}
      className="ml-auto p-1 rounded text-zinc-600 hover:text-zinc-300 transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

function EndpointRow({ endpoint }: { endpoint: Endpoint }) {
  const [open, setOpen] = useState(false)
  const fullPath = `${BASE}${endpoint.path}`

  return (
    <div className="border border-zinc-800/60 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-900/40 hover:bg-zinc-900/70 transition-colors text-left"
      >
        <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded border font-mono shrink-0', METHOD_COLORS[endpoint.method])}>
          {endpoint.method}
        </span>
        <span className="text-sm font-mono text-zinc-300">{fullPath}</span>
        <span className="text-xs text-zinc-600 ml-2 hidden sm:block truncate">{endpoint.description}</span>
        {open
          ? <ChevronDown className="h-3.5 w-3.5 text-zinc-600 ml-auto shrink-0" />
          : <ChevronRight className="h-3.5 w-3.5 text-zinc-600 ml-auto shrink-0" />
        }
      </button>

      {open && (
        <div className="px-4 py-4 border-t border-zinc-800/60 space-y-4 bg-zinc-950/50">
          <p className="text-sm text-zinc-400">{endpoint.description}</p>

          {endpoint.queryParams && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-600 uppercase tracking-wider">Query Parameters</p>
              <div className="space-y-1">
                {endpoint.queryParams.map(p => (
                  <div key={p.name} className="flex items-start gap-3 text-sm">
                    <code className="text-cyan-400 font-mono text-xs shrink-0 w-32">{p.name}</code>
                    <span className="text-zinc-600 text-xs shrink-0">{p.type}</span>
                    <span className="text-zinc-500 text-xs">{p.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {endpoint.body && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-600 uppercase tracking-wider">Request Body (JSON)</p>
              <div className="space-y-1">
                {endpoint.body.map(p => (
                  <div key={p.name} className="flex items-start gap-3 text-sm">
                    <code className="text-cyan-400 font-mono text-xs shrink-0 w-36">
                      {p.name}
                      {p.required && <span className="text-red-400 ml-0.5">*</span>}
                    </code>
                    <span className="text-zinc-600 text-xs shrink-0 w-20">{p.type}</span>
                    <span className="text-zinc-500 text-xs">{p.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <p className="text-xs text-zinc-600 uppercase tracking-wider">Returns</p>
            <code className="text-xs text-zinc-400 font-mono">{endpoint.returns}</code>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs text-zinc-600 uppercase tracking-wider">Example (curl)</p>
            <div className="flex items-center gap-2 bg-zinc-900 rounded px-3 py-2 font-mono text-xs text-zinc-400 border border-zinc-800">
              <span className="truncate">
                curl -X {endpoint.method} https://friends.servrar.net{fullPath}{' '}
                -H "X-API-Key: &lt;your-key&gt;"
                {(endpoint.method === 'POST' || endpoint.method === 'PUT') ? ' -H "Content-Type: application/json" -d \'{}\'': ''}
              </span>
              <CopyButton text={`curl -X ${endpoint.method} https://friends.servrar.net${fullPath} -H "X-API-Key: <your-key>"${(endpoint.method === 'POST' || endpoint.method === 'PUT') ? " -H \"Content-Type: application/json\" -d '{}'" : ''}`} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ApiReferencePage() {
  const [downloaded, setDownloaded] = useState(false)

  function handleDownload() {
    const md = generateMarkdown()
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'friendOS-api-reference.md'
    a.click()
    URL.revokeObjectURL(url)
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 2000)
  }

  return (
    <div className="p-8 space-y-8 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-white">API Reference</h1>
          <p className="text-sm text-zinc-500 mt-1">Base URL: <code className="text-zinc-400 font-mono">https://friends.servrar.net/api/v1</code></p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-700 bg-zinc-900 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white hover:shadow-[0_0_8px_hsla(185,100%,50%,0.15)] transition-all duration-200 shrink-0"
        >
          {downloaded
            ? <><Check className="h-3.5 w-3.5 text-emerald-400" /> downloaded</>
            : <><Download className="h-3.5 w-3.5" /> export markdown</>
          }
        </button>
      </div>

      {/* Auth */}
      <div className="space-y-3">
        <h2 className="text-xs text-zinc-600 uppercase tracking-wider">Authentication</h2>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-4 space-y-3 text-sm text-zinc-400">
          <div className="flex items-start gap-3">
            <span className="text-zinc-600 shrink-0 w-24">Bearer JWT</span>
            <code className="font-mono text-xs text-zinc-400">Authorization: Bearer &lt;oidc-access-token&gt;</code>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-zinc-600 shrink-0 w-24">API Key</span>
            <code className="font-mono text-xs text-zinc-400">X-API-Key: &lt;your-key&gt;</code>
          </div>
        </div>
      </div>

      {/* Endpoints by group */}
      {API_GROUPS.map(group => (
        <div key={group.tag} className="space-y-2">
          <h2 className="text-xs text-zinc-600 uppercase tracking-wider">{group.tag}</h2>
          <div className="space-y-2">
            {group.endpoints.map(ep => (
              <EndpointRow key={`${ep.method}-${ep.path}`} endpoint={ep} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
