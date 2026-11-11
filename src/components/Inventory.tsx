import { useState } from 'react'
import { isCombinationAvailable, productUrl, type Catalog, type Stock } from '../catalog'
import type { Language, Text } from '../i18n'
import { Icon } from './Icon'
import { InventoryActionModal } from './InventoryActionModal'

function stockTone(value: number) {
  if (value <= 0) return 'stock-zero'
  if (value <= 2) return 'stock-low'
  if (value <= 5) return 'stock-medium'
  return 'stock-good'
}

export function Inventory({ t, language, stock, updated, refresh, loading, catalog }: { t: Text; language: Language; stock: Stock[]; updated: Date | null; refresh: () => Promise<void>; loading: boolean; catalog: Catalog }) {
  const [room, setRoom] = useState('all')
  const [material, setMaterial] = useState('all')
  const [onlyStock, setOnlyStock] = useState(false)
  const [selected,setSelected] = useState<{material:string;color:string}|null>(null)
  const visibleMaterials = catalog.materials.filter(m => material === 'all' || m === material)
  const filtered = stock.filter(s => room === 'all' || s.room === room)
  const amount = (color: string, type: string) => filtered.filter(s => s.color === color && s.material === type).reduce((sum,s) => sum + s.quantity, 0)
  const visibleColors = catalog.colors.filter(c => !onlyStock || visibleMaterials.some(m => amount(c.id,m) > 0))
  const total = filtered.filter(s => material === 'all' || s.material === material).reduce((sum,s) => sum + s.quantity,0)
  return <>
    <div className="flex flex-wrap items-start justify-between gap-4"><h1 className="page-title">{t.inventory}</h1><div className="flex flex-wrap gap-2"><a className="secondary" href="#use"><Icon name="used" className="h-4 w-4" />{t.use}</a><a className="primary" href="#add"><Icon name="addStock" className="h-4 w-4" />{t.add}</a></div></div>
    <div className="my-7 flex flex-wrap items-end gap-4"><label className="field-label flex-1 sm:max-w-44">{t.room}<select className="input mt-2" value={room} onChange={e => setRoom(e.target.value)}><option value="all">{t.all}</option>{catalog.rooms.map(r => <option key={r}>{r}</option>)}</select></label><label className="field-label flex-1 sm:max-w-52">{t.material}<select className="input mt-2" value={material} onChange={e => setMaterial(e.target.value)}><option value="all">{t.allMaterials}</option>{catalog.materials.map(m => <option key={m}>{m}</option>)}</select></label><button onClick={()=>void refresh()} className="secondary" disabled={loading}><Icon name="refresh" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{t.refresh}</button></div>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-red-700" checked={onlyStock} onChange={e => setOnlyStock(e.target.checked)} />{t.inStock}</label><p className="text-sm text-neutral-500">{t.total} <strong className="ml-2 text-xl font-semibold tabular-nums text-black">{total}</strong> {t.spools}</p></div>
    {total === 0 && <p className="notice mb-4">{t.noStock}</p>}
    <div className="table-scroll overflow-auto rounded-xl border border-neutral-200" tabIndex={0} role="region" aria-label={t.inventory}>
      <table className="w-full border-collapse text-sm"><caption className="sr-only">{t.inventory} · {room === 'all' ? t.all : room}</caption><thead><tr><th className="sticky left-0 z-20 min-w-44 bg-neutral-100 px-4 py-4 text-left">{t.color}</th>{visibleMaterials.map(m => <th key={m} className="min-w-28 whitespace-nowrap bg-neutral-100 px-3 py-4 text-center text-xs font-semibold"><span className="inline-flex items-center gap-1">{m}{productUrl(m) && <a href={productUrl(m)!} target="_blank" rel="noreferrer" aria-label={`${m} ${t.purchase}`} className="text-neutral-400 hover:text-black"><Icon name="external" className="h-3 w-3" /></a>}</span></th>)}<th className="bg-neutral-100 px-4">{t.total}</th></tr></thead><tbody>{visibleColors.map(c => <tr className="border-t border-neutral-200" key={c.id}><th className="sticky left-0 z-10 bg-white px-4 py-3 text-left text-xs font-medium"><span className="flex items-center gap-3"><span className="h-7 w-7 shrink-0 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor:c.hex }} />{c[language]}</span></th>{visibleMaterials.map(m => {const value = amount(c.id,m); const available=isCombinationAvailable(catalog,m,c.id); return <td className={`p-0 text-center font-bold tabular-nums ${available ? stockTone(value) : 'stock-na'}`} key={m}>{available ? <button className="stock-cell" onClick={()=>setSelected({material:m,color:c.id})} aria-label={`${m} ${c[language]}: ${value}. ${t.updateStock}`}>{value}</button> : '—'}</td>})}<td className="px-4 text-center font-semibold tabular-nums">{visibleMaterials.reduce((sum,m) => sum + amount(c.id,m),0)}</td></tr>)}</tbody></table>
    </div>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-neutral-500">{t.updated}: {updated?.toLocaleString(language === 'zh' ? 'zh-CN' : language === 'ja' ? 'ja-JP' : 'en-US') ?? '—'}</p><div className="stock-legend" aria-label="Stock color legend"><span className="stock-good">6+</span><span className="stock-medium">3–5</span><span className="stock-low">1–2</span><span className="stock-zero">0</span><span className="stock-na">—</span></div></div>
    {selected&&<InventoryActionModal material={selected.material} color={selected.color} initialRoom={room} catalog={catalog} stock={stock} t={t} language={language} onClose={()=>setSelected(null)} onSaved={refresh} />}
  </>
}
