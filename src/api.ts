import { fallbackCatalog, type Catalog, type Color, type Entry, type Movement, type ProcurementVote, type Stock } from './catalog'

const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const configured = Boolean(url && key)

export type AuthUser = { id: string; email: string }
type Session = { access_token: string; refresh_token: string; user: AuthUser }
const sessionKey = 'filament-auth-session'
let session: Session | null = (() => {
  try { return JSON.parse(localStorage.getItem(sessionKey) || 'null') }
  catch { return null }
})()

export function currentUser() { return session?.user ?? null }
export function isAdmin(user: AuthUser | null) { return Boolean(user?.email?.toLowerCase().endsWith('@dragon.t.u-tokyo.ac.jp')) }

export class ApiError extends Error {
  constructor(public code: 'error' | 'notConfigured' | 'insufficient' | 'loginError' | 'adminOnly') { super(code) }
}

async function apiFetch(path: string, init: RequestInit = {}, auth = true) {
  if (!configured) throw new ApiError('notConfigured')
  const headers: Record<string,string> = { apikey:key!, 'Content-Type':'application/json', ...(init.headers as Record<string,string> || {}) }
  if (auth && session?.access_token) headers.Authorization = `Bearer ${session.access_token}`
  return fetch(`${url}/${path}`, { ...init, headers, signal:AbortSignal.timeout(15000) })
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await apiFetch(`rest/v1/${path}`, init)
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}))
    if (detail.message?.includes('INSUFFICIENT_STOCK')) throw new ApiError('insufficient')
    if (response.status === 401 || response.status === 403) throw new ApiError('adminOnly')
    throw new ApiError('error')
  }
  return response.status === 204 ? undefined as T : response.json()
}

export async function signIn(email: string, password: string) {
  const response = await apiFetch('auth/v1/token?grant_type=password', { method:'POST', body:JSON.stringify({ email, password }) }, false)
  if (!response.ok) throw new ApiError('loginError')
  session = await response.json() as Session
  localStorage.setItem(sessionKey, JSON.stringify(session))
  return session.user
}

export async function restoreSession() {
  if (!session) return null
  const response = await apiFetch('auth/v1/user', {}, true)
  if (!response.ok) { localStorage.removeItem(sessionKey); session = null; return null }
  session.user = await response.json() as AuthUser
  localStorage.setItem(sessionKey, JSON.stringify(session))
  return session.user
}

export async function signOut() {
  if (session) await apiFetch('auth/v1/logout', { method:'POST' }).catch(() => undefined)
  session = null
  localStorage.removeItem(sessionKey)
}

export async function loadInventory() {
  const [stock, movements] = await Promise.all([
    request<Stock[]>('stock?select=room,material,color,quantity&quantity=gt.0'),
    request<Movement[]>('movements?select=id,kind,room,destination,material,color,quantity,created_at&order=created_at.desc&limit=12'),
  ])
  return { stock, movements }
}

export async function loadCatalog(): Promise<Catalog> {
  try {
    const [roomRows, materialRows, colorRows, combinations, settings] = await Promise.all([
      request<{code:string}[]>('rooms?select=code&active=eq.true&order=display_order'),
      request<{name:string}[]>('materials?select=name&active=eq.true&order=display_order'),
      request<{name:string;hex:string;label_ja:string;label_en:string;label_zh:string}[]>('colors?select=name,hex,label_ja,label_en,label_zh&active=eq.true&order=display_order'),
      request<{material:string;color:string;available:boolean}[]>('material_colors?select=material,color,available'),
      request<{value_integer:number}[]>('app_settings?select=value_integer&key=eq.low_stock_threshold'),
    ])
    const colors: Color[] = colorRows.map(c => ({ id:c.name, hex:c.hex, ja:c.label_ja, en:c.label_en, zh:c.label_zh }))
    return { rooms:roomRows.map(r => r.code), materials:materialRows.map(m => m.name), colors, unavailable:combinations.filter(c => !c.available).map(c => `${c.material}::${c.color}`), lowStockThreshold:settings[0]?.value_integer ?? 1 }
  } catch { return fallbackCatalog }
}

export async function saveEntry(entry: Entry, requestId: string) {
  return request<string>('rpc/record_movement', { method:'POST', body:JSON.stringify({ p_kind:entry.kind, p_room:entry.room, p_destination:entry.kind === 'transfer' ? entry.destination : null, p_material:entry.material, p_color:entry.color, p_quantity:entry.quantity, p_request_id:requestId }) })
}

export async function loadProcurementVotes() {
  return request<ProcurementVote[]>('procurement_votes?select=id,material,color,quantity,created_at&order=created_at.desc&limit=100')
}

export async function submitProcurementVote(material: string, color: string, quantity: number, requestId: string) {
  return request<string>('rpc/submit_procurement_vote', { method:'POST', body:JSON.stringify({ p_material:material, p_color:color, p_quantity:quantity, p_request_id:requestId }) })
}

export async function addCatalogItem(kind: 'room' | 'material' | 'color', value: Record<string,unknown>) {
  if (!isAdmin(currentUser())) throw new ApiError('adminOnly')
  const table = kind === 'room' ? 'rooms' : kind === 'material' ? 'materials' : 'colors'
  await request(table, { method:'POST', headers:{ Prefer:'return=minimal' }, body:JSON.stringify(value) })
}

export async function setCatalogItemActive(kind: 'room' | 'material' | 'color', id: string, active: boolean) {
  if (!isAdmin(currentUser())) throw new ApiError('adminOnly')
  const table = kind === 'room' ? 'rooms' : kind === 'material' ? 'materials' : 'colors'
  const field = kind === 'room' ? 'code' : 'name'
  await request(`${table}?${field}=eq.${encodeURIComponent(id)}`, { method:'PATCH', headers:{ Prefer:'return=minimal' }, body:JSON.stringify({ active }) })
}

export async function setCombination(material: string, color: string, available: boolean) {
  if (!isAdmin(currentUser())) throw new ApiError('adminOnly')
  await request('material_colors?on_conflict=material,color', { method:'POST', headers:{ Prefer:'resolution=merge-duplicates,return=minimal' }, body:JSON.stringify({ material, color, available }) })
}

export async function setLowStockThreshold(value: number) {
  if (!isAdmin(currentUser())) throw new ApiError('adminOnly')
  await request('app_settings?key=eq.low_stock_threshold', { method:'PATCH', headers:{ Prefer:'return=minimal' }, body:JSON.stringify({ value_integer:value }) })
}
