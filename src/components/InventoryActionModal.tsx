import { useEffect, useRef, useState, type FormEvent } from 'react'
import { saveEntry } from '../api'
import type { Catalog, Operation, Stock } from '../catalog'
import type { Language, Text } from '../i18n'
import { Icon } from './Icon'

type Action = Operation | 'set'

export function InventoryActionModal({ material, color, initialRoom, catalog, stock, t, language, onClose, onSaved }: { material:string; color:string; initialRoom:string; catalog:Catalog; stock:Stock[]; t:Text; language:Language; onClose:()=>void; onSaved:()=>Promise<void> }) {
  const [action,setAction]=useState<Action>('add')
  const [room,setRoom]=useState(initialRoom==='all'?(catalog.rooms[0]??''):initialRoom)
  const [destination,setDestination]=useState('')
  const [quantity,setQuantity]=useState(1)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const requestId=useRef(crypto.randomUUID())
  const current=stock.find(s=>s.room===room&&s.material===material&&s.color===color)?.quantity??0
  const colorData=catalog.colors.find(c=>c.id===color)
  useEffect(()=>{ const close=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose()}; window.addEventListener('keydown',close); return()=>window.removeEventListener('keydown',close)},[onClose])
  function select(next:Action){setAction(next);setQuantity(next==='set'?current:1);setError('');requestId.current=crypto.randomUUID()}
  async function submit(event:FormEvent){event.preventDefault();setError('')
    let kind:Operation=action==='set'?(quantity>=current?'add':'use'):action
    let amount=action==='set'?Math.abs(quantity-current):quantity
    if(action==='set'&&amount===0){onClose();return}
    if((kind==='use'||kind==='transfer')&&amount>current){setError(t.insufficient);return}
    if(kind==='transfer'&&(!destination||destination===room)){setError(t.sameRoom);return}
    setBusy(true)
    try{await saveEntry({kind,room,destination:kind==='transfer'?destination:'',material,color,quantity:amount},requestId.current);await onSaved();onClose()}
    catch{setError(t.error)}finally{setBusy(false)}
  }
  return <div className="modal-backdrop" role="presentation" onMouseDown={event=>{if(event.currentTarget===event.target)onClose()}}><section className="stock-modal" role="dialog" aria-modal="true" aria-labelledby="stock-modal-title">
    <button className="modal-close" onClick={onClose} aria-label={t.close}>×</button>
    <div className="flex items-center gap-3"><span className="h-10 w-10 rounded-full border border-black/15" style={{backgroundColor:colorData?.hex}} /><div><h2 id="stock-modal-title">{t.updateStock}</h2><p>{material} / {colorData?.[language]??color}</p></div></div>
    <div className="action-tabs" role="tablist">{(['add','use','transfer','set'] as Action[]).map(value=><button type="button" role="tab" aria-selected={action===value} onClick={()=>select(value)} key={value}>{value==='set'?t.setQuantity:t[value]}</button>)}</div>
    <form onSubmit={submit} className="mt-6 space-y-5">
      <label className="field-label">{t.room}<select className="input mt-2" value={room} onChange={e=>{setRoom(e.target.value);if(action==='set')setQuantity(stock.find(s=>s.room===e.target.value&&s.material===material&&s.color===color)?.quantity??0)}}>{catalog.rooms.map(r=><option key={r}>{r}</option>)}</select></label>
      {action==='transfer'&&<label className="field-label">{t.to}<select className="input mt-2" required value={destination} onChange={e=>setDestination(e.target.value)}><option value="">{t.chooseTo}</option>{catalog.rooms.map(r=><option disabled={r===room} key={r}>{r}</option>)}</select></label>}
      <label className="field-label">{action==='set'?t.setQuantity:t.quantity}<div className="mt-2 flex"><button type="button" className="stepper rounded-l border-l" onClick={()=>setQuantity(Math.max(action==='set'?0:1,quantity-1))}><Icon name="minus" className="h-4 w-4" /></button><input className="input rounded-none text-center text-lg font-bold" type="number" min={action==='set'?0:1} max="999" value={quantity} onChange={e=>setQuantity(e.target.valueAsNumber)} /><button type="button" className="stepper rounded-r" onClick={()=>setQuantity(Math.min(999,quantity+1))}><Icon name="plus" className="h-4 w-4" /></button></div></label>
      <p className="text-xs text-neutral-500">{t.available}: <b>{current}</b> {t.spools}</p>
      {error&&<p className="error" role="alert">{error}</p>}
      <div className="flex gap-3 border-t border-neutral-200 pt-5"><button type="button" className="secondary flex-1" onClick={onClose}>{t.cancel}</button><button className="primary flex-1" disabled={busy}>{busy?t.busy:t.continue}</button></div>
    </form>
  </section></div>
}
