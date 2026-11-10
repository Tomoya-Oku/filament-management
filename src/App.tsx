import { useCallback, useEffect, useState } from 'react'
import { ApiError, currentUser, loadInventory, signOut } from './api'
import { formUrl, type Movement, type Stock } from './catalog'
import { detectLanguage, translations, type Language } from './i18n'
import { Home } from './components/Home'
import { EntryForm } from './components/EntryForm'
import { Inventory } from './components/Inventory'
import { Login } from './components/Login'
import { Icon } from './components/Icon'

const routes = ['home','inventory','add','use','transfer','login'] as const
type Route = typeof routes[number]
function readRoute(): Route { const value = window.location.hash.slice(1); return routes.includes(value as Route) ? value as Route : 'home' }

export default function App() {
  const [language, setLanguage] = useState<Language>(detectLanguage)
  const [route, setRoute] = useState<Route>(readRoute)
  const [user, setUser] = useState(currentUser)
  const [stock, setStock] = useState<Stock[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<keyof typeof translations.ja | null>(null)
  const [updated, setUpdated] = useState<Date | null>(null)
  const t = translations[language]
  const refresh = useCallback(async () => {
    if (!currentUser()) return
    setLoading(true); setError(null)
    try { const value = await loadInventory(); setStock(value.stock); setMovements(value.movements); setUpdated(new Date()) }
    catch (err) { setError(err instanceof ApiError ? err.code : 'error'); if (!currentUser()) setUser(null) }
    finally { setLoading(false) }
  },[])
  useEffect(() => { if (user) void refresh() },[user,refresh])
  useEffect(() => {
    const changed = () => { setRoute(readRoute()); window.scrollTo(0,0) }
    window.addEventListener('hashchange',changed)
    return () => window.removeEventListener('hashchange',changed)
  },[])
  useEffect(() => { document.documentElement.lang = language === 'zh' ? 'zh-CN' : language; localStorage.setItem('dragon-language',language) },[language])
  useEffect(() => {
    const focused = () => { if (currentUser()) void refresh() }
    window.addEventListener('focus',focused)
    return () => window.removeEventListener('focus',focused)
  },[refresh])
  async function logout() { setUser(null); setStock([]); setMovements([]); setUpdated(null); setError(null); await signOut(); window.location.hash = 'home' }
  return <div className="flex min-h-screen flex-col bg-white text-neutral-900">
    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:bg-white focus:p-3">{t.forms}</a>
    <header className="border-b border-neutral-200"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 px-5 sm:px-8">
      <a href="#home" aria-label="DRAGON Lab Filament Management" className="py-5"><span className="block text-[21px] font-bold leading-6 tracking-tight">DRAGON Lab</span><span className="text-xs text-neutral-500">Filament Management</span></a>
      <nav className="order-3 flex w-full items-center gap-7 border-t border-neutral-100 sm:order-none sm:w-auto sm:border-0" aria-label={t.home}>{(['home','inventory'] as const).map(r => <a href={`#${r}`} aria-current={route === r ? 'page' : undefined} key={r} className={`border-b-2 py-4 text-sm ${route === r ? 'border-black font-semibold' : 'border-transparent text-neutral-500 hover:text-black'}`}>{t[r]}</a>)}</nav>
      <div className="flex items-center gap-2 sm:gap-4"><select aria-label="Language / 言語 / 语言" className="min-h-11 bg-white text-xs sm:text-sm" value={language} onChange={e => setLanguage(e.target.value as Language)}><option value="ja">日本語</option><option value="en">English</option><option value="zh">中文</option></select>{user ? <button onClick={logout} className="min-h-11 px-2 text-xs text-neutral-500 hover:text-black">{t.signOut}</button> : <a href="#login" className="min-h-11 content-center px-2 text-xs font-medium">{t.signIn}</a>}</div>
    </div></header>
    <main id="main-content" className={`mx-auto w-full flex-1 px-5 py-8 sm:px-8 sm:py-10 ${route === 'inventory' ? 'max-w-6xl' : 'max-w-4xl'}`}>
      {route === 'home' ? <Home t={t} /> : !user || route === 'login' ? <Login t={t} onLogin={() => { setUser(currentUser()); if (route === 'login') window.location.hash = 'inventory' }} /> : <>
        {error && <div role="alert" className="error mb-6 flex flex-wrap items-center justify-between gap-3"><p>{t[error]}</p><button className="secondary" onClick={() => void refresh()}>{t.retry}</button></div>}
        {loading && !updated ? <p role="status" className="py-16 text-center text-neutral-500">{t.loading}</p> : error && !updated ? null : route === 'inventory' ? <Inventory t={t} language={language} stock={stock} movements={movements} updated={updated} refresh={() => void refresh()} loading={loading} /> : route === 'add' || route === 'use' || route === 'transfer' ? <EntryForm key={route} kind={route} t={t} language={language} stock={stock} onSaved={refresh} /> : null}
      </>}
    </main>
    <footer className="mt-12 border-t border-neutral-200"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-6 text-xs text-neutral-500 sm:px-8"><p>DRAGON Lab <span className="mx-2">/</span> {t.footer}</p><a href={formUrl} target="_blank" rel="noreferrer" className="external-link"><Icon name="external" className="h-3 w-3" />{t.originalForm}</a></div></footer>
  </div>
}
