import { useState } from 'react'
import { colors, materials, rooms, sheetUrl, type Movement, type Stock } from '../catalog'
import type { Language, Text } from '../i18n'
import { Icon } from './Icon'

export function Inventory({ t, language, stock, movements, updated, refresh, loading }: { t: Text; language: Language; stock: Stock[]; movements: Movement[]; updated: Date | null; refresh: () => void; loading: boolean }) {
  const [room, setRoom] = useState('all')
  const [material, setMaterial] = useState('all')
  const [onlyStock, setOnlyStock] = useState(false)
  const visibleMaterials = materials.filter(m => material === 'all' || m === material)
  const filtered = stock.filter(s => room === 'all' || s.room === room)
  const amount = (color: string, type: string) => filtered.filter(s => s.color === color && s.material === type).reduce((sum,s) => sum + s.quantity, 0)
  const visibleColors = colors.filter(c => !onlyStock || visibleMaterials.some(m => amount(c.id,m) > 0))
  const total = filtered.filter(s => material === 'all' || s.material === material).reduce((sum,s) => sum + s.quantity,0)
  return <>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.inventory}</h1><a href={sheetUrl} className="external-link mt-3" target="_blank" rel="noreferrer"><Icon name="external" className="h-4 w-4" />{t.sheets}</a></div><a className="primary" href="#add"><Icon name="plus" className="h-4 w-4" />{t.add}</a></div>
    <div className="my-7 flex flex-wrap items-end gap-4"><label className="field-label flex-1 sm:max-w-44">{t.room}<select className="input mt-2" value={room} onChange={e => setRoom(e.target.value)}><option value="all">{t.all}</option>{rooms.map(r => <option key={r}>{r}</option>)}</select></label><label className="field-label flex-1 sm:max-w-52">{t.material}<select className="input mt-2" value={material} onChange={e => setMaterial(e.target.value)}><option value="all">{t.allMaterials}</option>{materials.map(m => <option key={m}>{m}</option>)}</select></label><button onClick={refresh} className="secondary" disabled={loading}><Icon name="refresh" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t.refresh}</button></div>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-black" checked={onlyStock} onChange={e => setOnlyStock(e.target.checked)} />{t.inStock}</label><p className="text-sm text-neutral-500">{t.total} <strong className="ml-2 text-xl font-semibold tabular-nums text-black">{total}</strong> {t.spools}</p></div>
    {total === 0 && <p className="notice mb-4">{t.noStock}</p>}
    <div className="table-scroll overflow-auto rounded border border-neutral-200" tabIndex={0} role="region" aria-label={t.inventory}>
      <table className="w-full border-collapse text-sm"><caption className="sr-only">{t.inventory} · {room === 'all' ? t.all : room}</caption><thead><tr><th className="sticky left-0 z-20 min-w-40 bg-neutral-100 px-4 py-4 text-left">{t.color}</th>{visibleMaterials.map(m => <th key={m} className="min-w-24 whitespace-nowrap bg-neutral-100 px-3 py-4 text-center text-xs font-semibold">{m}</th>)}<th className="bg-neutral-100 px-4">{t.total}</th></tr></thead><tbody>{visibleColors.map(c => <tr className="border-t border-neutral-200" key={c.id}><th className="sticky left-0 z-10 bg-white px-4 py-3 text-left text-xs font-medium"><span className="flex items-center gap-2"><span className="h-3 w-3 shrink-0 rounded-full border border-black/10" style={{ backgroundColor:c.hex }} />{c[language]}</span></th>{visibleMaterials.map(m => {const value = amount(c.id,m); return <td className={`px-3 py-3 text-center tabular-nums ${value ? 'bg-neutral-100 font-semibold text-black' : 'text-neutral-400'}`} key={m}>{value}</td>})}<td className="px-4 text-center font-semibold tabular-nums">{visibleMaterials.reduce((sum,m) => sum + amount(c.id,m),0)}</td></tr>)}</tbody></table>
    </div>
    <p className="mt-3 text-xs text-neutral-500">{t.updated}: {updated?.toLocaleString(language === 'zh' ? 'zh-CN' : language === 'ja' ? 'ja-JP' : 'en-US') ?? '—'}</p>
    <section className="mt-12"><h2 className="mb-4 text-xl font-bold">{t.history}</h2>{movements.length === 0 ? <p className="text-sm text-neutral-500">{t.noHistory}</p> : <ul className="divide-y divide-neutral-200 border-y border-neutral-200">{movements.map(m => <li key={m.id} className="flex items-start justify-between gap-4 py-4 text-sm"><div><p className="font-semibold">{t[m.kind]} <span className="ml-2 font-normal">{m.quantity} {t.spools}</span></p><p className="mt-1 text-xs leading-5 text-neutral-500">{m.material} · {colors.find(c => c.id === m.color)?.[language] ?? m.color} · {m.room}{m.destination ? ` → ${m.destination}` : ''}</p></div><time className="shrink-0 text-xs leading-5 text-neutral-500" dateTime={m.created_at}>{new Date(m.created_at).toLocaleDateString(language)}<br />{new Date(m.created_at).toLocaleTimeString(language,{ hour:'2-digit',minute:'2-digit' })}</time></li>)}</ul>}</section>
  </>
}
