import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { handleCallback } from '@/lib/auth'

export default function CallbackPage() {
  const navigate = useNavigate()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    handleCallback(window.location.search)
      .then(() => navigate('/dashboard', { replace: true }))
      .catch((err) => {
        console.error('Auth callback error:', err)
        navigate('/login?error=callback_failed', { replace: true })
      })
  }, [navigate])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-xs text-zinc-600 tracking-widest uppercase animate-pulse">Authenticating…</p>
    </div>
  )
}
