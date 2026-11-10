import type { Entry, Movement, Stock } from './catalog'

const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const configured = Boolean(url && key)
type Session = { access_token: string; refresh_token: string; expires_at: number; user: { id: string; email: string } }
let session: Session | null = null
try { session = JSON.parse(sessionStorage.getItem('dragon-session') || 'null') } catch { /* corrupted storage is treated as signed out */ }
export class ApiError extends Error {
  constructor(public code: 'error' | 'notMember' | 'sessionExpired' | 'notConfigured' | 'insufficient' | 'loginError') { super(code) }
}
export const currentUser = () => session?.user ?? null
function saveSession(value: Session | null) {
  session = value
  if (value) sessionStorage.setItem('dragon-session', JSON.stringify(value))
  else sessionStorage.removeItem('dragon-session')
}
async function auth(body: object, grant: string): Promise<Session> {
  if (!configured) throw new ApiError('notConfigured')
  const response = await fetch(`${url}/auth/v1/token?grant_type=${grant}`, {
    method: 'POST', headers: { apikey: key, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) throw new ApiError('loginError')
  const value = await response.json()
  const next = { ...value, expires_at: Math.floor(Date.now() / 1000) + value.expires_in } as Session
  saveSession(next)
  return next
}
let refreshing: Promise<Session> | null = null
async function token() {
  if (!session) throw new ApiError('sessionExpired')
  if (session.expires_at < Date.now() / 1000 + 60) {
    refreshing ??= auth({ refresh_token: session.refresh_token }, 'refresh_token').finally(() => { refreshing = null })
    try { await refreshing } catch { saveSession(null); throw new ApiError('sessionExpired') }
  }
  return session!.access_token
}
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!configured) throw new ApiError('notConfigured')
  const access = await token()
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init, headers: { apikey: key, Authorization: `Bearer ${access}`, 'Content-Type': 'application/json', ...init.headers }, signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}))
    if (response.status === 401) { saveSession(null); throw new ApiError('sessionExpired') }
    if (detail.message?.includes('INSUFFICIENT_STOCK')) throw new ApiError('insufficient')
    if (response.status === 403 || detail.message?.includes('NOT_A_MEMBER')) throw new ApiError('notMember')
    throw new ApiError('error')
  }
  return response.status === 204 ? undefined as T : response.json()
}
export async function signIn(email: string, password: string) {
  await auth({ email: email.trim(), password }, 'password')
  try {
    const members = await request<{ user_id: string }[]>('lab_members?select=user_id')
    if (!members.length) throw new ApiError('notMember')
  } catch (error) { saveSession(null); throw error }
  return currentUser()
}
export async function signOut() {
  const access = session?.access_token
  saveSession(null)
  if (access && configured) {
    await fetch(`${url}/auth/v1/logout?scope=local`, { method: 'POST', headers: { apikey: key, Authorization: `Bearer ${access}` }, signal: AbortSignal.timeout(10000) }).catch(() => {})
  }
}
export async function loadInventory() {
  const [members, stock, movements] = await Promise.all([
    request<{ user_id: string }[]>('lab_members?select=user_id'),
    request<Stock[]>('stock?select=room,material,color,quantity&quantity=gt.0'),
    request<Movement[]>('movements?select=id,kind,room,destination,material,color,quantity,created_at&order=created_at.desc&limit=12'),
  ])
  if (!members.length) throw new ApiError('notMember')
  return { stock, movements }
}
export async function saveEntry(entry: Entry, requestId: string) {
  return request<string>('rpc/record_movement', { method: 'POST', body: JSON.stringify({ p_kind: entry.kind, p_room: entry.room, p_destination: entry.kind === 'transfer' ? entry.destination : null, p_material: entry.material, p_color: entry.color, p_quantity: entry.quantity, p_request_id: requestId }) })
}
