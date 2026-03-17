import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, LogIn } from 'lucide-react'
import { isAuthenticated, startLogin } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated()) navigate('/dashboard', { replace: true })
  }, [navigate])

  async function handleLogin() {
    setLoading(true)
    await startLogin()
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center bg-ambient">
      <div className="w-full max-w-sm space-y-8 px-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-[0_0_20px_hsla(185,100%,50%,0.08)]">
            <Heart className="h-5 w-5 text-[hsl(var(--secondary))]" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-medium text-[hsl(var(--foreground))] tracking-wide">friendOS</h1>
            <p className="text-xs text-[hsl(var(--foreground-subtle))] mt-1">personal crm</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 space-y-5 shadow-[0_0_40px_hsla(185,100%,50%,0.04)]">
          <div>
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">Sign in</p>
            <p className="text-xs text-[hsl(var(--foreground-subtle))] mt-1">Authenticate with your Pocket-ID passkey</p>
          </div>

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-white text-black hover:bg-zinc-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] border border-transparent gap-2"
          >
            <LogIn className="h-4 w-4" />
            {loading ? 'Redirecting…' : 'Continue with Pocket-ID'}
          </Button>
        </div>
      </div>
    </div>
  )
}
