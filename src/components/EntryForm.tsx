import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { isCombinationAvailable, productUrl, type Catalog, type Entry, type Operation, type Stock } from '../catalog'
import { ApiError, saveEntry } from '../api'
import type { Language, Text } from '../i18n'
import { validateEntry } from '../validation.mjs'
import { Icon } from './Icon'

export function EntryForm({ kind, t, language, stock, catalog, onSaved }: { kind: Operation; t: Text; language: Language; stock: Stock[]; catalog: Catalog; onSaved: () => Promise<void> }) {
  const [entry, setEntry] = useState<Entry>({ kind, room:catalog.rooms[0] ?? '', destination:'', material:catalog.materials[0] ?? '', color:'', quantity:1 })
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState<'edit' | 'confirm' | 'success'>('edit')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const requestId = useRef(crypto.randomUUID())
  const sending = useRef(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const available = stock.find(s => s.room === entry.room && s.material === entry.material && s.color === entry.color)?.quantity ?? 0
  const selected = catalog.colors.find(c => c.id === entry.color)
  const matches = catalog.colors.filter(c => isCombinationAvailable(catalog,entry.material,c.id) && `${c.id} ${c[language]}`.toLowerCase().includes(search.toLowerCase()))
  function update(patch: Partial<Entry>) { setEntry(value => ({ ...value, ...patch })); requestId.current = crypto.randomUUID(); setError('') }
  function review(event: FormEvent) {
    event.preventDefault()
    const issue = validateEntry(entry)
    if (issue) { setError(t[issue]); return }
    if (!isCombinationAvailable(catalog,entry.material,entry.color)) { setError(t.invalidCombination); return }
    if (kind !== 'add' && entry.quantity > available) { setError(t.insufficient); return }
    setError(''); setStage('confirm'); window.scrollTo(0,0); heading.current?.focus()
  }
  async function submit() {
    if (sending.current) return
    sending.current = true; setBusy(true); setError('')
    try { await saveEntry(entry, requestId.current); setStage('success'); window.scrollTo(0,0); await onSaved() }
    catch (err) { setError(t[err instanceof ApiError ? err.code : 'error']) }
    finally { sending.current = false; setBusy(false) }
  }
  function reset() { setEntry({ kind, room:catalog.rooms[0] ?? '', destination:'', material:catalog.materials[0] ?? '', color:'', quantity:1 }); requestId.current = crypto.randomUUID(); setStage('edit'); setError(''); setSearch('') }
  return <div className="mx-auto max-w-2xl">
    <a className="external-link mb-7" href="#home"><Icon name="back" className="h-4 w-4" />{t.back}</a>
    <h1 ref={heading} tabIndex={-1} className="text-2xl font-bold tracking-tight outline-none sm:text-3xl">{stage === 'confirm' ? t.confirmTitle : t[kind]}</h1>
    {stage === 'success' ? <div className="mt-10 border-y border-neutral-200 py-10 text-center">
      <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white"><Icon name="check" className="h-7 w-7" /></span>
      <h2 role="status" className="text-lg font-bold">{t.success}</h2><div className="mt-7 flex flex-wrap justify-center gap-3"><button className="primary" onClick={reset}>{t.next}</button><a className="secondary" href="#inventory">{t.viewStock}</a></div>
    </div> : stage === 'confirm' ? <div className="mt-8">
      <p className="text-sm text-neutral-500">{t.confirmationHelp}</p>
      <dl className="my-6 divide-y divide-neutral-200 border-y border-neutral-200">{[[t.forms,t[kind]],[kind === 'transfer' ? t.from : t.room,entry.room],...(kind === 'transfer' ? [[t.to,entry.destination]] : []),[t.material,entry.material],[t.color,selected?.[language] ?? entry.color],[t.quantity,String(entry.quantity)]].map(([label,value]) => <div className="flex justify-between gap-5 py-4" key={label}><dt className="text-sm text-neutral-500">{label}</dt><dd className="text-right text-sm font-semibold">{value}</dd></div>)}</dl>
      {error && <p role="alert" className="error mb-5">{error}</p>}
      <div className="flex flex-col gap-3 sm:flex-row"><button className="primary flex-1" disabled={busy} onClick={submit}>{busy ? t.busy : t.confirm}</button><button className="secondary" disabled={busy} onClick={() => setStage('edit')}>{t.cancel}</button></div>
    </div> : <form onSubmit={review} className="mt-8 space-y-7">
      <div className={`grid gap-5 ${kind === 'transfer' ? 'sm:grid-cols-2' : ''}`}>
        <label className="field-label">{kind === 'transfer' ? t.from : t.room}<select className="input mt-2" value={entry.room} onChange={e => update({ room:e.target.value })}>{catalog.rooms.map(room => <option key={room}>{room}</option>)}</select></label>
        {kind === 'transfer' && <label className="field-label">{t.to}<select className="input mt-2" required value={entry.destination} onChange={e => update({ destination:e.target.value })}><option value="">{t.chooseTo}</option>{catalog.rooms.map(room => <option disabled={room === entry.room} key={room}>{room}</option>)}</select></label>}
      </div>
      <label className="field-label">{t.material}<select className="input mt-2" value={entry.material} onChange={e => { const material=e.target.value; update({ material, color:isCombinationAvailable(catalog,material,entry.color) ? entry.color : '' }); setSearch('') }}>{catalog.materials.map(m => <option key={m}>{m}</option>)}</select></label>
      {productUrl(entry.material) && <a className="external-link -mt-5" href={productUrl(entry.material)!} target="_blank" rel="noreferrer">{t.purchase}<Icon name="external" className="h-4 w-4" /></a>}
      <label className="field-label">{t.quantity}<div className="mt-2 flex"><input className="input rounded-r-none text-center text-lg font-bold" type="number" inputMode="numeric" required min={1} max={999} step={1} value={Number.isNaN(entry.quantity) ? '' : entry.quantity} onChange={e => update({ quantity:e.target.valueAsNumber })} /><button type="button" className="stepper gap-1 px-3" disabled={entry.quantity <= 1} aria-label={`${t.quantity} −1`} onClick={() => update({ quantity: Math.max(1, entry.quantity - 1) })}><Icon name="minus" className="h-5 w-5" /><span className="text-xs font-bold">1</span></button><button type="button" className="stepper gap-1 rounded-r px-3" disabled={entry.quantity >= 999} aria-label={`${t.quantity} +1`} onClick={() => update({ quantity:Math.min(999, entry.quantity + 1) })}><Icon name="plus" className="h-5 w-5" /><span className="text-xs font-bold">1</span></button></div></label>
      <fieldset>{selected && <div className="selected-color mb-5"><span className="h-10 w-10 rounded-full border-2 border-white shadow ring-1 ring-black/10" style={{backgroundColor:selected.hex}} /><span><small>{t.selectedColor}</small><strong>{selected[language]}</strong></span></div>}<legend className="field-label">{t.color}</legend>
        <p className="mt-2 text-xs leading-6 text-neutral-500">{entry.material === 'Support' ? t.supportHelp : t.colorHelp}</p>
        {entry.material !== 'Support' && <input className="input my-4" type="search" placeholder={t.search} aria-label={t.search} value={search} onChange={e => setSearch(e.target.value)} />}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 sm:gap-4">{matches.map(c => <label key={c.id} className={`color-option relative flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border p-3 text-center transition ${entry.color === c.id ? 'border-red-700 bg-red-50 ring-2 ring-red-700' : 'border-neutral-200 hover:border-neutral-500'}`}>
          <input className="peer sr-only" type="radio" name="color" value={c.id} checked={entry.color === c.id} onChange={() => update({ color:c.id })} />
          <span className="absolute inset-0 rounded peer-focus-visible:ring-2 peer-focus-visible:ring-black peer-focus-visible:ring-offset-4" />
          <span className="h-16 w-16 rounded-full border border-black/15 shadow-sm" style={{ backgroundColor:c.hex }} /><span className="mt-3 text-[11px] font-semibold leading-4 sm:text-xs">{c[language]}</span>
          {entry.color === c.id && <span className="absolute right-2 top-2 rounded-full bg-red-700 p-1 text-white"><Icon name="check" className="h-3 w-3" /></span>}
        </label>)}</div>
      </fieldset>
      {entry.color && kind !== 'add' && <p className="notice">{t.available}: <strong>{available}</strong> {t.spools} · {entry.room}</p>}
      {error && <p role="alert" className="error">{error}</p>}
      <button type="submit" className="primary w-full">{t.submit}<Icon name="arrow" className="h-4 w-4" /></button>
    </form>}
  </div>
}
