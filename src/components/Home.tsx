import type { Catalog, Movement, Stock } from '../catalog'
import type { Language, Text } from '../i18n'
import { Icon } from './Icon'

const actions = [
  { kind:'add', icon:'addStock', href:'#add' },
  { kind:'use', icon:'used', href:'#use' },
  { kind:'transfer', icon:'move', href:'#transfer' },
  { kind:'scanner', icon:'camera', href:'#scanner' },
] as const

export function Home({ t, language, stock, movements, catalog }: { t: Text; language: Language; stock: Stock[]; movements: Movement[]; catalog: Catalog }) {
  const threshold=catalog.lowStockThreshold
  const low = stock.filter(item=>item.quantity<=threshold).sort((a,b)=>a.quantity-b.quantity).slice(0,4)
  const records = movements.slice(0,Math.max(1,6-low.length))
  return <>
    <div className="castle-heading"><span aria-hidden="true" /><h1 className="page-title">{t.home}</h1></div>
    <div className="home-grid mt-7">
      <section className="home-actions">{actions.map(action => <a href={action.href} key={action.kind} className="action-card group"><span className="action-icon"><Icon name={action.icon} className="h-8 w-8" /></span><strong>{t[action.kind]}</strong>{action.kind==='scanner'&&<small>{t.experimental}</small>}<Icon name="arrow" className="ml-auto h-5 w-5 transition group-hover:translate-x-1" /></a>)}</section>
      <section className="notification-board"><h2>{t.notifications}</h2><div>{low.map(item=>{const color=catalog.colors.find(c=>c.id===item.color);return <article className="notification-row urgent" key={`${item.room}-${item.material}-${item.color}`}><Icon name="alert" className="h-5 w-5" /><p><strong>{t.lowStock}: {item.material} / {color?.[language]??item.color}</strong><span>{t.remaining} {item.quantity} {t.spools} · {item.room}</span></p></article>})}{records.map(item=>{const color=catalog.colors.find(c=>c.id===item.color);return <article className="notification-row" key={item.id}><Icon name="document" className="h-5 w-5" /><p><strong>{t.newRecord}: {t[item.kind]} {item.quantity} {t.spools}</strong><span>{item.material} / {color?.[language]??item.color} · {item.room}{item.destination?` → ${item.destination}`:''}</span></p><time>{new Date(item.created_at).toLocaleDateString(language)}</time></article>})}{low.length===0&&records.length===0&&<p className="p-6 text-sm text-neutral-500">{t.noHistory}</p>}</div></section>
    </div>
  </>
}
