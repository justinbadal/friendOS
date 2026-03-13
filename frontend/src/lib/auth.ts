const ISSUER = import.meta.env.VITE_OIDC_ISSUER as string
const CLIENT_ID = import.meta.env.VITE_OIDC_CLIENT_ID as string
const REDIRECT_URI = `${window.location.origin}/callback`

const STORAGE_KEYS = {
  accessToken: 'auth.access_token',
  refreshToken: 'auth.refresh_token',
  expiresAt: 'auth.expires_at',
  codeVerifier: 'auth.code_verifier',
  state: 'auth.state',
  userEmail: 'auth.user_email',
  userName: 'auth.user_name',
}

// ─── PKCE helpers ─────────────────────────────────────────────────────────────

function base64url(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function generateVerifier(): string {
  const buf = new Uint8Array(32)
  crypto.getRandomValues(buf)
  return base64url(buf.buffer)
}

async function generateChallenge(verifier: string): Promise<string> {
  const encoded = new TextEncoder().encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', encoded)
  return base64url(hash)
}

// ─── OIDC discovery ───────────────────────────────────────────────────────────

let _discovery: Record<string, string> | null = null

async function discover(): Promise<Record<string, string>> {
  if (!_discovery) {
    const res = await fetch(`${ISSUER}/.well-known/openid-configuration`)
    _discovery = await res.json()
  }
  return _discovery!
}

// ─── Token storage ────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  const token = localStorage.getItem(STORAGE_KEYS.accessToken)
  const expiresAt = Number(localStorage.getItem(STORAGE_KEYS.expiresAt) ?? 0)
  if (!token || Date.now() > expiresAt) return null
  return token
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null
}

function storeTokens(data: { access_token: string; refresh_token?: string; expires_in?: number }) {
  localStorage.setItem(STORAGE_KEYS.accessToken, data.access_token)
  if (data.refresh_token) localStorage.setItem(STORAGE_KEYS.refreshToken, data.refresh_token)
  const expiresIn = data.expires_in ?? 3600
  localStorage.setItem(STORAGE_KEYS.expiresAt, String(Date.now() + (expiresIn - 60) * 1000))
}

export function clearTokens() {
  Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k))
}

export function getUserEmail(): string {
  return localStorage.getItem(STORAGE_KEYS.userEmail) ?? ''
}

export function getUserName(): string {
  return localStorage.getItem(STORAGE_KEYS.userName) ?? ''
}

async function fetchAndStoreUserInfo(accessToken: string): Promise<void> {
  try {
    const config = await discover()
    const res = await fetch(config.userinfo_endpoint, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) return
    const data = await res.json()
    if (data.email) localStorage.setItem(STORAGE_KEYS.userEmail, data.email)
    if (data.name) localStorage.setItem(STORAGE_KEYS.userName, data.name)
    else if (data.preferred_username) localStorage.setItem(STORAGE_KEYS.userName, data.preferred_username)
  } catch {
    // non-fatal
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function startLogin() {
  const config = await discover()
  const verifier = generateVerifier()
  const challenge = await generateChallenge(verifier)
  const state = generateVerifier()

  sessionStorage.setItem(STORAGE_KEYS.codeVerifier, verifier)
  sessionStorage.setItem(STORAGE_KEYS.state, state)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'openid email profile',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state,
  })

  window.location.href = `${config.authorization_endpoint}?${params}`
}

// ─── Callback ─────────────────────────────────────────────────────────────────

export async function handleCallback(search: string): Promise<void> {
  const params = new URLSearchParams(search)
  const code = params.get('code')
  const returnedState = params.get('state')
  const savedState = sessionStorage.getItem(STORAGE_KEYS.state)
  const verifier = sessionStorage.getItem(STORAGE_KEYS.codeVerifier)

  if (!code || returnedState !== savedState || !verifier) {
    throw new Error('Invalid callback parameters')
  }

  sessionStorage.removeItem(STORAGE_KEYS.state)
  sessionStorage.removeItem(STORAGE_KEYS.codeVerifier)

  const config = await discover()

  const res = await fetch(config.token_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      code,
      code_verifier: verifier,
    }),
  })

  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`)
  const tokens = await res.json()
  storeTokens(tokens)
  await fetchAndStoreUserInfo(tokens.access_token)
}

// ─── Refresh ──────────────────────────────────────────────────────────────────

export async function refreshTokens(): Promise<boolean> {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken)
  if (!refreshToken) return false

  try {
    const config = await discover()
    const res = await fetch(config.token_endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: CLIENT_ID,
        refresh_token: refreshToken,
      }),
    })
    if (!res.ok) return false
    storeTokens(await res.json())
    return true
  } catch {
    return false
  }
}
