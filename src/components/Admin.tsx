import { useState, type FormEvent } from 'react'
import { addCatalogItem, isAdmin, setCatalogItemActive, setCombination, type AuthUser } from '../api'
import { isCombinationAvailable, type Catalog } from '../catalog'
import type { Text } from '../i18n'
import { Icon } from './Icon'

export function Admin({ t, user, catalog, refresh }: { t: Text; user: AuthUser | null; catalog: Catalog; refresh: () => Promise<void> }) {
  const [room,setRoom] = useState('')
  const [material,setMaterial] = useState('')
  const [officialUrl,setOfficialUrl] = useState('')
  const [color,setColor] = useState({name:'',hex:'#c52a2f',ja:'',en:'',zh:''})
  const [matrixMaterial,setMatrixMaterial] = useState(catalog.materials[0] ?? '')
  const [message,setMessage] = useState('')
  if (!isAdmin(user)) return <div className="mx-auto max-w-xl pt-10 text-center"><Icon name="lock" className="mx-auto h-12 w-12 text-red-700" /><h1 className="page-title mt-5">{t.adminTitle}</h1><p className="mt-4 text-sm leading-7 text-neutral-600">{t.adminOnly}</p><a className="primary mt-7" href="#login">{t.signIn}</a></div>
  async function run(task: () => Promise<void>) { setMessage(''); try { await task(); await refresh(); setMessage('保存しました') } catch { setMessage(t.error) } }
  async function addRoom(event:FormEvent) { event.preventDefault(); await run(() => addCatalogItem('room',{code:room})); setRoom('') }
  async function addMaterial(event:FormEvent) { event.preventDefault(); await run(() => addCatalogItem('material',{name:material,official_url:officialUrl||null})); setMaterial(''); setOfficialUrl('') }
  async function addColor(event:FormEvent) { event.preventDefault(); await run(() => addCatalogItem('color',{name:color.name,hex:color.hex,label_ja:color.ja||color.name,label_en:color.en||color.name,label_zh:color.zh||color.name})); setColor({name:'',hex:'#c52a2f',ja:'',en:'',zh:''}) }
  return <div className="mx-auto max-w-6xl">
    <div className="flex items-start gap-4"><span className="action-icon"><Icon name="settings" /></span><div><h1 className="page-title">{t.adminTitle}</h1><p className="mt-2 text-sm text-neutral-500">{t.adminHelp}</p></div></div>
    {message && <p className="notice mt-6" role="status">{message}</p>}
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      <section className="admin-section"><h2>{t.room}</h2><form className="mt-4 flex gap-2" onSubmit={addRoom}><input className="input" required value={room} onChange={e=>setRoom(e.target.value)} placeholder="例: 62C1" /><button className="primary">{t.addItem}</button></form><ul className="admin-list">{catalog.rooms.map(item=><li key={item}><span>{item}</span><button onClick={()=>void run(()=>setCatalogItemActive('room',item,false))}>{t.deactivate}</button></li>)}</ul></section>
      <section className="admin-section"><h2>{t.material}</h2><form className="mt-4 space-y-2" onSubmit={addMaterial}><input className="input" required value={material} onChange={e=>setMaterial(e.target.value)} placeholder="PLA Matte" /><input className="input" type="url" value={officialUrl} onChange={e=>setOfficialUrl(e.target.value)} placeholder="https://…" /><button className="primary w-full">{t.addItem}</button></form><ul className="admin-list">{catalog.materials.map(item=><li key={item}><span>{item}</span><button onClick={()=>void run(()=>setCatalogItemActive('material',item,false))}>{t.deactivate}</button></li>)}</ul></section>
      <section className="admin-section"><h2>{t.color}</h2><form className="mt-4 space-y-2" onSubmit={addColor}><div className="flex gap-2"><input className="h-12 w-16 rounded-lg border border-neutral-300 p-1" type="color" value={color.hex} onChange={e=>setColor({...color,hex:e.target.value})} /><input className="input" required value={color.name} onChange={e=>setColor({...color,name:e.target.value})} placeholder="内部ID" /></div><input className="input" value={color.ja} onChange={e=>setColor({...color,ja:e.target.value})} placeholder="日本語名" /><input className="input" value={color.en} onChange={e=>setColor({...color,en:e.target.value})} placeholder="English" /><input className="input" value={color.zh} onChange={e=>setColor({...color,zh:e.target.value})} placeholder="中文" /><button className="primary w-full">{t.addItem}</button></form><ul className="admin-list">{catalog.colors.map(item=><li key={item.id}><span className="flex items-center gap-2"><i style={{backgroundColor:item.hex}} />{item.ja}</span><button onClick={()=>void run(()=>setCatalogItemActive('color',item.id,false))}>{t.deactivate}</button></li>)}</ul></section>
    </div>
    <section className="admin-section mt-6"><div className="flex flex-wrap items-center justify-between gap-4"><h2>{t.combinations}</h2><select className="input max-w-64" value={matrixMaterial} onChange={e=>setMatrixMaterial(e.target.value)}>{catalog.materials.map(m=><option key={m}>{m}</option>)}</select></div><div className="matrix-grid mt-5">{catalog.colors.map(c=>{const enabled=isCombinationAvailable(catalog,matrixMaterial,c.id); return <button key={c.id} className={enabled?'enabled':''} onClick={()=>void run(()=>setCombination(matrixMaterial,c.id,!enabled))}><i style={{backgroundColor:c.hex}} /><span>{c.ja}</span><small>{enabled?t.availableCombination:t.unavailable}</small></button>})}</div></section>
  </div>
}
