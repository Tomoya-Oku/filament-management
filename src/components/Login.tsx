import { useState, type FormEvent } from 'react'
import { ApiError, signIn, type AuthUser } from '../api'
import type { Text } from '../i18n'
import { Icon } from './Icon'

export function Login({ t, onSignedIn }: { t: Text; onSignedIn: (user: AuthUser) => void }) {
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [busy,setBusy] = useState(false)
  const [error,setError] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    try { onSignedIn(await signIn(email,password)) }
    catch (err) { setError(t[err instanceof ApiError ? err.code : 'loginError']) }
    finally { setBusy(false) }
  }
  return <div className="mx-auto max-w-md pt-6">
    <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-700"><Icon name="lock" className="h-7 w-7" /></div>
    <h1 className="page-title">{t.loginTitle}</h1>
    <p className="mt-3 text-sm leading-6 text-neutral-600">{t.loginHelp}</p>
    <form className="mt-8 space-y-5" onSubmit={submit}>
      <label className="field-label">{t.email}<input className="input mt-2" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label className="field-label">{t.password}<input className="input mt-2" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="primary w-full" disabled={busy}>{busy ? t.loginBusy : t.signIn}</button>
    </form>
  </div>
}
