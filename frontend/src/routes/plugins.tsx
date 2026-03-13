import { useState } from 'react'
import { Smartphone, CheckCircle2, Circle, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  n: number
  title: string
  detail: string
  code?: string
}

interface Plugin {
  id: string
  name: string
  description: string
  category: string
  status: 'available' | 'coming_soon'
  steps: Step[]
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'https://your-server.com'

const PLUGINS: Plugin[] = [
  {
    id: 'siri-shortcut',
    name: 'Siri Shortcut',
    description: 'Log a phone call with a friend in seconds straight from your iPhone — right after you hang up.',
    category: 'iOS',
    status: 'available',
    steps: [
      {
        n: 1,
        title: 'Get your API key',
        detail: 'In your server .env, set API_KEY to a secure random string. You\'ll use this in every request.',
        code: `# backend/config/.env\nAPI_KEY=your-secure-random-key`,
      },
      {
        n: 2,
        title: 'Create a new Shortcut',
        detail: 'Open the Shortcuts app → tap + → name it "Log Call with Friend".',
      },
      {
        n: 3,
        title: 'Add an "Ask for Input" action',
        detail: 'Action: Ask for Input → Type: Text → Prompt: "Who did you just call?" → name the variable: name',
      },
      {
        n: 4,
        title: 'Search for the contact',
        detail: 'Add a "Get Contents of URL" action with these settings:',
        code: `URL:    ${API_BASE}/api/v1/shortcuts/search?name=[name]\nMethod: GET\nHeaders:\n  X-API-Key: your-secure-random-key`,
      },
      {
        n: 5,
        title: 'Add a "Choose from List" action',
        detail: 'Add "Choose from List" → set input to the result from step 4 → Key Path: full_name. Name the result: chosen',
      },
      {
        n: 6,
        title: 'Get the contact ID',
        detail: 'Add "Get Dictionary Value" → Dictionary: result from step 4 → Key: id (matched where full_name = chosen). Name it: contact_id',
      },
      {
        n: 7,
        title: 'Ask how the call went',
        detail: 'Add "Choose from Menu" → Prompt: "How did it go?" → Options: great, good, neutral, difficult. Name the result: sentiment',
      },
      {
        n: 8,
        title: 'Log the interaction',
        detail: 'Add another "Get Contents of URL" action:',
        code: `URL:    ${API_BASE}/api/v1/shortcuts/log\nMethod: POST\nHeaders:\n  X-API-Key: your-secure-random-key\n  Content-Type: application/json\nBody (JSON):\n  {\n    "contact_id": [contact_id],\n    "sentiment":  [sentiment]\n  }`,
      },
      {
        n: 9,
        title: 'Show confirmation',
        detail: 'Add "Show Notification" → Body: result from step 8, Key Path: message. Done.',
      },
      {
        n: 10,
        title: '(Optional) Set up automation',
        detail: 'Shortcuts → Automation → + → App → Phone → "Closes" → run your shortcut. It\'ll prompt you every time you end a call.',
      },
    ],
  },
  {
    id: 'weekly-digest',
    name: 'Weekly Email Digest',
    description: 'Get a weekly email every Monday summarising who you talked to, who\'s overdue, and upcoming birthdays.',
    category: 'Email',
    status: 'coming_soon',
    steps: [],
  },
  {
    id: 'birthday-reminders',
    name: 'Birthday Reminders',
    description: 'Automatic push notification or email a few days before a friend\'s birthday.',
    category: 'Notifications',
    status: 'coming_soon',
    steps: [],
  },
]

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative mt-2 rounded-lg bg-black border border-zinc-800 overflow-hidden">
      <button
        onClick={copy}
        className="absolute top-2 right-2 p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <pre className="p-4 text-xs text-zinc-300 font-mono overflow-x-auto leading-relaxed whitespace-pre">
        {code}
      </pre>
    </div>
  )
}

function PluginCard({ plugin }: { plugin: Plugin }) {
  const [open, setOpen] = useState(false)
  const available = plugin.status === 'available'

  return (
    <div className={cn(
      'rounded-xl border bg-zinc-900/40 transition-colors',
      available ? 'border-zinc-800 hover:border-zinc-700' : 'border-zinc-800/50 opacity-60'
    )}>
      {/* Header */}
      <div className="flex items-start gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700">
          <Smartphone className="h-5 w-5 text-zinc-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium text-zinc-100">{plugin.name}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-500">
              {plugin.category}
            </span>
            {available ? (
              <span className="text-xs px-2 py-0.5 rounded-full border border-green-900/60 bg-green-900/20 text-green-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Available
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-600 flex items-center gap-1">
                <Circle className="h-3 w-3" /> Coming soon
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-500 mt-1">{plugin.description}</p>
        </div>
        {available && plugin.steps.length > 0 && (
          <button
            onClick={() => setOpen(o => !o)}
            className="shrink-0 flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors border border-zinc-700 hover:border-zinc-600 rounded-lg px-3 py-1.5"
          >
            {open ? 'Hide' : 'Setup'}
            {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {/* Steps */}
      {open && plugin.steps.length > 0 && (
        <div className="border-t border-zinc-800 px-5 py-4 space-y-5">
          {plugin.steps.map(step => (
            <div key={step.n} className="flex gap-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-xs font-medium text-zinc-300 mt-0.5">
                {step.n}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200">{step.title}</p>
                <p className="text-sm text-zinc-500 mt-0.5">{step.detail}</p>
                {step.code && <CodeBlock code={step.code} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PluginsPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-white">Plugins</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Extend friendOS with integrations and automations
        </p>
      </div>

      <div className="space-y-3">
        {PLUGINS.map(plugin => (
          <PluginCard key={plugin.id} plugin={plugin} />
        ))}
      </div>
    </div>
  )
}
