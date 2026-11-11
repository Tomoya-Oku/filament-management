import { useCallback, useEffect, useState } from 'react'
import { currentUser, isAdmin, loadCatalog, loadInventory, loadProcurementVotes, restoreSession, signOut, type AuthUser } from './api'
import { fallbackCatalog, type Catalog, type Movement, type ProcurementVote, type Stock } from './catalog'
import { detectLanguage, translations, type Language } from './i18n'
import { Admin } from './components/Admin'
import { EntryForm } from './components/EntryForm'
import { Home } from './components/Home'
import { Inventory } from './components/Inventory'
import { Login } from './components/Login'
import { Procurement } from './components/Procurement'
import { RecentActivity } from './components/RecentActivity'
import { ColorScanner } from './components/ColorScanner'

const routes = ['home','history','inventory','procurement','admin','add','use','transfer','scanner'] as const
type Route = typeof routes[number]
function readRoute(): Route { const value = window.location.hash.slice(1); return routes.includes(value as Route) ? value as Route : 'home' }

export default function App() {
  const [language, setLanguage] = useState<Language>(detectLanguage)
  const [route, setRoute] = useState<Route>(readRoute)
  const [stock, setStock] = useState<Stock[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [votes,setVotes] = useState<ProcurementVote[]>([])
  const [catalog,setCatalog] = useState<Catalog>(fallbackCatalog)
  const [user,setUser] = useState<AuthUser|null>(currentUser())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [updated, setUpdated] = useState<Date | null>(null)
  const t = translations[language]
  const refresh = useCallback(async () => {
    setLoading(true); setError(false)
    try { const [inventory,nextCatalog] = await Promise.all([loadInventory(),loadCatalog()]); setStock(inventory.stock); setMovements(inventory.movements); setCatalog(nextCatalog); setUpdated(new Date()) }
    catch { setError(true) }
    finally { setLoading(false) }
  },[])
  const refreshVotes = useCallback(async () => { try { setVotes(await loadProcurementVotes()) } catch { setVotes([]) } },[])
  useEffect(() => { void refresh(); void refreshVotes(); void restoreSession().then(setUser) },[refresh,refreshVotes])
  useEffect(() => {
    const changed = () => { setRoute(readRoute()); window.scrollTo(0,0) }
    window.addEventListener('hashchange',changed)
    return () => window.removeEventListener('hashchange',changed)
  },[])
  useEffect(() => { document.documentElement.lang = language === 'zh' ? 'zh-CN' : language; localStorage.setItem('filagon-language',language) },[language])
  const nav = ['home','history','inventory','procurement','admin'] as const
  return <div className="min-h-screen bg-white text-neutral-950">
    <a href="#main-content" onClick={event => { event.preventDefault(); document.getElementById('main-content')?.focus() }} className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:bg-white focus:p-3">{t.forms}</a>
    <header className="app-header"><div className="header-inner">
      <a href="#home" aria-label="FILAGON" className="brand"><img src="/filagon-icon.svg" alt="" /><span>FILAGON</span></a>
      <nav className="main-nav" aria-label={t.home}>{nav.map(r => <a href={`#${r}`} aria-current={route === r ? 'page' : undefined} key={r}>{t[r]}</a>)}</nav>
      <div className="header-actions"><div className="language-switch" role="group" aria-label={t.language}>{(['ja','en','zh'] as const).map(code => <button aria-pressed={language===code} onClick={()=>setLanguage(code)} key={code}>{code==='ja'?'日本語':code==='en'?'EN':'中文'}</button>)}</div></div>
    </div></header>
    <main id="main-content" tabIndex={-1} className={`main-shell ${route==='inventory'||route==='admin'?'wide':''}`}>
      {error && <div role="alert" className="error mb-6 flex items-center justify-between gap-3"><p>{t.error}</p><button className="secondary" onClick={()=>void refresh()}>{t.retry}</button></div>}
      {loading && !updated ? <p role="status" className="py-16 text-center text-neutral-500">{t.loading}</p> : route==='home' ? <Home t={t} language={language} stock={stock} movements={movements} catalog={catalog} /> : route==='history' ? <RecentActivity t={t} language={language} movements={movements} catalog={catalog} /> : route==='inventory' ? <Inventory t={t} language={language} stock={stock} updated={updated} refresh={refresh} loading={loading} catalog={catalog} /> : route==='procurement' ? <Procurement t={t} language={language} catalog={catalog} votes={votes} onSaved={refreshVotes} /> : route==='scanner' ? <ColorScanner t={t} language={language} catalog={catalog} /> : route==='admin' ? isAdmin(user) ? <Admin t={t} user={user} catalog={catalog} refresh={async()=>{setCatalog(await loadCatalog())}} onSignOut={async()=>{await signOut();setUser(null)}} /> : <Login t={t} onSignedIn={value=>setUser(value)} /> : <EntryForm key={route} kind={route} t={t} language={language} stock={stock} catalog={catalog} onSaved={refresh} />}
    </main>
  </div>
}
