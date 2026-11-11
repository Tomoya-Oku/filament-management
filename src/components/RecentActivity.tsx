import type { Catalog, Movement } from '../catalog'
import type { Language, Text } from '../i18n'

export function RecentActivity({ t, language, movements, catalog }: { t: Text; language: Language; movements: Movement[]; catalog: Catalog }) {
  return <div className="mx-auto max-w-4xl">
    <div className="castle-heading"><span aria-hidden="true" /> <h1 className="page-title">{t.history}</h1></div>
    {movements.length === 0 ? <p className="notice mt-7">{t.noHistory}</p> : <ol className="activity-list mt-7">{movements.map((m,index) => {
      const color = catalog.colors.find(c => c.id === m.color)
      return <li key={m.id}><span className="activity-index">{String(index+1).padStart(2,'0')}</span><div className="min-w-0 flex-1"><strong>{t[m.kind]}</strong><p>{m.material} · {color?.[language] ?? m.color} · {m.room}{m.destination ? ` → ${m.destination}` : ''}</p></div><b>{m.quantity} {t.spools}</b><time dateTime={m.created_at}>{new Date(m.created_at).toLocaleString(language === 'zh' ? 'zh-CN' : language === 'ja' ? 'ja-JP' : 'en-US',{dateStyle:'medium',timeStyle:'short'})}</time></li>
    })}</ol>}
  </div>
}
