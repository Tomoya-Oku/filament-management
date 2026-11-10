import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { colors, materials, rooms, type Entry, type Operation, type Stock } from '../catalog'
import { ApiError, saveEntry } from '../api'
import type { Language, Text } from '../i18n'
import { validateEntry } from '../validation.mjs'
import { Icon } from './Icon'
import { SpoolImage } from './SpoolImage'

export function EntryForm({ kind, t, language, stock, onSaved }: { kind: Operation; t: Text; language: Language; stock: Stock[]; onSaved: () => Promise<void> }) {
  const [entry, setEntry] = useState<Entry>({ kind, room:'62C1', destination:'', material:'PLA Basic', color:'', quantity:1 })
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState<'edit' | 'confirm' | 'success'>('edit')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const requestId = useRef(crypto.randomUUID())
  const sending = useRef(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const available = stock.find(s => s.room === entry.room && s.material === entry.material && s.color === entry.color)?.quantity ?? 0
  const selected = colors.find(c => c.id === entry.color)
  const matches = colors.filter(c => (entry.material === 'Support' ? c.id === 'N/A' : c.id !== 'N/A') && `${c.id} ${c[language]}`.toLowerCase().includes(search.toLowerCase()))
  function update(patch: Partial<Entry>) { setEntry(value => ({ ...value, ...patch })); requestId.current = crypto.randomUUID(); setError('') }
  function review(event: FormEvent) {
    event.preventDefault()
    const issue = validateEntry(entry)
    if (issue) { setError(t[issue]); return }
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
  function reset() { setEntry({ kind, room:'62C1', destination:'', material:'PLA Basic', color:'', quantity:1 }); requestId.current = crypto.randomUUID(); setStage('edit'); setError(''); setSearch('') }
  return <div className="mx-auto max-w-2xl">
    <a className="external-link mb-7" href="#home"><Icon name="back" className="h-4 w-4" />{t.back}</a>
    <h1 ref={heading} tabIndex={-1} className="text-2xl font-bold tracking-tight outline-none sm:text-3xl">{stage === 'confirm' ? t.confirmTitle : t[kind]}</h1>
    <p className="mt-3 text-sm leading-6 text-neutral-500">{t[`${kind}Desc`]}</p>
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
        <label className="field-label">{kind === 'transfer' ? t.from : t.room}<select className="input mt-2" value={entry.room} onChange={e => update({ room:e.target.value })}>{rooms.map(room => <option key={room}>{room}</option>)}</select></label>
        {kind === 'transfer' && <label className="field-label">{t.to}<select className="input mt-2" required value={entry.destination} onChange={e => update({ destination:e.target.value })}><option value="">{t.chooseTo}</option>{rooms.map(room => <option disabled={room === entry.room} key={room}>{room}</option>)}</select></label>}
      </div>
      <label className="field-label">{t.material}<select className="input mt-2" value={entry.material} onChange={e => { update({ material:e.target.value, color:e.target.value === 'Support' ? 'N/A' : entry.color === 'N/A' ? '' : entry.color }); setSearch('') }}>{materials.map(m => <option key={m}>{m}</option>)}</select></label>
      <label className="field-label">{t.quantity}<div className="mt-2 flex"><input className="input rounded-r-none" type="number" inputMode="numeric" required min={1} max={999} step={1} value={Number.isNaN(entry.quantity) ? '' : entry.quantity} onChange={e => update({ quantity:e.target.valueAsNumber })} /><button type="button" className="stepper" disabled={entry.quantity <= 1} aria-label={`${t.quantity} −1`} onClick={() => update({ quantity: Math.max(1, entry.quantity - 1) })}><Icon name="minus" className="h-4 w-4" /></button><button type="button" className="stepper rounded-r" disabled={entry.quantity >= 999} aria-label={`${t.quantity} +1`} onClick={() => update({ quantity:Math.min(999, entry.quantity + 1) })}><Icon name="plus" className="h-4 w-4" /></button></div></label>
      <fieldset><legend className="field-label">{t.color}{selected && <span className="ml-3 font-normal text-neutral-500">{selected[language]}</span>}</legend>
        <p className="mt-2 text-xs leading-6 text-neutral-500">{entry.material === 'Support' ? t.supportHelp : t.colorHelp}</p>
        {entry.material !== 'Support' && <input className="input my-4" type="search" placeholder={t.search} aria-label={t.search} value={search} onChange={e => setSearch(e.target.value)} />}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">{matches.map(c => <label key={c.id} className={`color-option relative flex cursor-pointer flex-col items-center rounded border p-2 text-center transition ${entry.color === c.id ? 'border-black ring-1 ring-black' : 'border-neutral-200 hover:border-neutral-500'}`}>
          <input className="peer sr-only" type="radio" name="color" value={c.id} checked={entry.color === c.id} onChange={() => update({ color:c.id })} />
          <span className="absolute inset-0 rounded peer-focus-visible:ring-2 peer-focus-visible:ring-black peer-focus-visible:ring-offset-4" />
          <div className="flex aspect-square w-full items-center"><SpoolImage color={c} /></div><span className="mt-1 text-[11px] leading-4 sm:text-xs">{c[language]}</span>
          {entry.color === c.id && <span className="absolute right-1 top-1 rounded-full bg-black p-0.5 text-white"><Icon name="check" className="h-3 w-3" /></span>}
        </label>)}</div>
      </fieldset>
      {entry.color && kind !== 'add' && <p className="notice">{t.available}: <strong>{available}</strong> {t.spools} · {entry.room}</p>}
      {error && <p role="alert" className="error">{error}</p>}
      <button type="submit" className="primary w-full">{t.submit}<Icon name="arrow" className="h-4 w-4" /></button>
    </form>}
  </div>
}
