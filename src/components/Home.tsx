import { isCombinationAvailable, type Catalog, type Stock } from '../catalog'
import type { Language, Text } from '../i18n'
import { Icon } from './Icon'

const actions = [
  { kind:'add', icon:'addStock' },
  { kind:'use', icon:'used' },
  { kind:'transfer', icon:'move' },
] as const

export function Home({ t, language, stock, catalog }: { t: Text; language: Language; stock: Stock[]; catalog: Catalog }) {
  const previewMaterials = catalog.materials.slice(0,3)
  const previewColors = catalog.colors.filter(c => previewMaterials.some(m => stock.some(s => s.material === m && s.color === c.id))).slice(0,6)
  const rows = previewColors.length ? previewColors : catalog.colors.slice(0,6)
  const amount = (color:string,material:string) => stock.filter(s => s.color === color && s.material === material).reduce((n,s) => n+s.quantity,0)
  return <>
    <h1 className="page-title">{t.home}</h1>
    <section className="action-grid mt-6">{actions.map(action => <a href={`#${action.kind}`} key={action.kind} className="action-card group"><span className="action-icon"><Icon name={action.icon} className="h-8 w-8" /></span><strong>{t[action.kind]}</strong><Icon name="arrow" className="ml-auto h-5 w-5 transition group-hover:translate-x-1" /></a>)}</section>
    <div className="dashboard-grid mt-8">
      <section className="dashboard-panel min-w-0"><div className="panel-heading"><h2 className="section-title">{t.inventory}</h2><a className="text-link" href="#inventory">{t.viewStock}<Icon name="arrow" className="h-4 w-4" /></a></div><div className="mt-5 overflow-auto rounded-lg border border-neutral-200"><table className="w-full min-w-[500px] border-collapse text-sm"><thead><tr><th className="bg-neutral-100 px-4 py-3 text-left">{t.color}</th>{previewMaterials.map(m => <th className="bg-neutral-100 px-3 py-3" key={m}>{m}</th>)}</tr></thead><tbody>{rows.map(c => <tr className="border-t border-neutral-200" key={c.id}><th className="px-4 py-3 text-left"><span className="flex items-center gap-3"><span className="h-7 w-7 rounded-full border border-black/10" style={{backgroundColor:c.hex}} />{c[language]}</span></th>{previewMaterials.map(m => {const available=isCombinationAvailable(catalog,m,c.id); const value=amount(c.id,m); return <td className={`px-3 py-3 text-center font-bold ${!available?'stock-na':value===0?'stock-zero':value<3?'stock-low':value<6?'stock-medium':'stock-good'}`} key={m}>{available?value:'—'}</td>})}</tr>)}</tbody></table></div></section>
      <section className="dashboard-panel survey-teaser"><div className="panel-heading"><h2 className="section-title">{t.procurement}</h2><Icon name="vote" className="h-6 w-6 text-red-700" /></div><div className="survey-graphic" aria-hidden="true">{catalog.colors.slice(0,8).map(c => <span key={c.id} style={{backgroundColor:c.hex}} />)}</div><a className="primary mt-auto w-full" href="#procurement"><Icon name="vote" className="h-5 w-5" />{t.vote}</a></section>
    </div>
  </>
}
