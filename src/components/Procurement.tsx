import { useMemo, useRef, useState, type FormEvent } from 'react'
import { submitProcurementVote } from '../api'
import { isCombinationAvailable, productUrl, type Catalog, type ProcurementVote } from '../catalog'
import type { Language, Text } from '../i18n'
import { Icon } from './Icon'

export function Procurement({ t, language, catalog, votes, onSaved }: { t: Text; language: Language; catalog: Catalog; votes: ProcurementVote[]; onSaved: () => Promise<void> }) {
  const [material,setMaterial] = useState(catalog.materials[0] ?? '')
  const [color,setColor] = useState('')
  const [quantity,setQuantity] = useState(1)
  const [busy,setBusy] = useState(false)
  const [message,setMessage] = useState('')
  const requestId = useRef(crypto.randomUUID())
  const availableColors = catalog.colors.filter(c => isCombinationAvailable(catalog,material,c.id))
  const totals = useMemo(() => Object.values(votes.reduce<Record<string,{material:string;color:string;quantity:number}>>((acc,v) => { const id=`${v.material}::${v.color}`; acc[id] ??= {material:v.material,color:v.color,quantity:0}; acc[id].quantity += v.quantity; return acc },{})).sort((a,b) => b.quantity-a.quantity),[votes])
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!color) { setMessage(t.selectColor); return }
    setBusy(true); setMessage('')
    try { await submitProcurementVote(material,color,quantity,requestId.current); requestId.current=crypto.randomUUID(); setMessage(t.voted); await onSaved() }
    catch { setMessage(t.error) }
    finally { setBusy(false) }
  }
  return <div className="mx-auto max-w-5xl">
    <h1 className="page-title">{t.procurement}</h1>
    <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_.85fr]">
      <form onSubmit={submit} className="rounded-2xl border border-neutral-200 p-5 sm:p-7">
        <h2 className="section-title">{t.procurementTitle}</h2>
        <label className="field-label mt-6">{t.material}<select className="input mt-2" value={material} onChange={e => {setMaterial(e.target.value); setColor('')}}>{catalog.materials.map(m => <option key={m}>{m}</option>)}</select></label>
        {productUrl(material) && <a className="external-link mt-1" target="_blank" rel="noreferrer" href={productUrl(material)!}>{t.purchase}<Icon name="external" className="h-4 w-4" /></a>}
        <fieldset className="mt-6"><legend className="field-label">{t.color}</legend><div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">{availableColors.map(c => <label key={c.id} title={c[language]} className={`survey-color ${color===c.id?'selected':''}`}><input className="sr-only" type="radio" name="survey-color" checked={color===c.id} onChange={() => setColor(c.id)} /><span style={{backgroundColor:c.hex}} /><small>{c[language]}</small></label>)}</div></fieldset>
        <label className="field-label mt-6">{t.quantity}<input className="input mt-2" type="number" min="1" max="99" value={quantity} onChange={e => setQuantity(e.target.valueAsNumber)} /></label>
        {message && <p className={`mt-5 text-sm ${message===t.voted?'text-green-700':'text-red-700'}`} role="status">{message}</p>}
        <button className="primary mt-6 w-full" disabled={busy}><Icon name="vote" className="h-5 w-5" />{busy?t.busy:t.vote}</button>
      </form>
      <section><h2 className="section-title">{t.surveyResults}</h2><div className="mt-5 space-y-3">{totals.length===0?<p className="notice">{t.noHistory}</p>:totals.map(item => {const c=catalog.colors.find(x=>x.id===item.color); return <div className="result-row" key={`${item.material}-${item.color}`}><span className="h-9 w-9 rounded-full border border-black/10" style={{backgroundColor:c?.hex}} /><span className="min-w-0 flex-1"><strong className="block truncate">{item.material}</strong><small>{c?.[language]??item.color}</small></span><b>{item.quantity}<small className="ml-1 font-normal">{t.spools}</small></b></div>})}</div></section>
    </div>
  </div>
}
