import type { Entry, Movement, Stock } from './catalog'

const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const configured = Boolean(url && key)
export class ApiError extends Error {
  constructor(public code: 'error' | 'notConfigured' | 'insufficient') { super(code) }
}
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!configured) throw new ApiError('notConfigured')
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init, headers: { apikey:key, 'Content-Type':'application/json', ...init.headers }, signal:AbortSignal.timeout(15000),
  })
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}))
    if (detail.message?.includes('INSUFFICIENT_STOCK')) throw new ApiError('insufficient')
    throw new ApiError('error')
  }
  return response.status === 204 ? undefined as T : response.json()
}
export async function loadInventory() {
  const [stock, movements] = await Promise.all([
    request<Stock[]>('stock?select=room,material,color,quantity&quantity=gt.0'),
    request<Movement[]>('movements?select=id,kind,room,destination,material,color,quantity,created_at&order=created_at.desc&limit=12'),
  ])
  return { stock, movements }
}
export async function saveEntry(entry: Entry, requestId: string) {
  return request<string>('rpc/record_movement', { method:'POST', body:JSON.stringify({ p_kind:entry.kind, p_room:entry.room, p_destination:entry.kind === 'transfer' ? entry.destination : null, p_material:entry.material, p_color:entry.color, p_quantity:entry.quantity, p_request_id:requestId }) })
}
