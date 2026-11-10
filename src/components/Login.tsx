import { useState } from 'react'
import type { FormEvent } from 'react'
import { ApiError, configured, signIn } from '../api'
import type { Text } from '../i18n'
import { Icon } from './Icon'

export function Login({ t, onLogin }: { t: Text; onLogin: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setBusy(true); setError('')
    try { await signIn(String(data.get('email')), String(data.get('password'))); onLogin() }
    catch (err) { setError(t[err instanceof ApiError ? err.code : 'error']) }
    finally { setBusy(false) }
  }
  return <section className="mx-auto my-8 max-w-md rounded border border-neutral-200 p-6 sm:my-12 sm:p-8">
    <Icon name="lock" className="mb-5 h-8 w-8" />
    <h2 className="text-xl font-bold">{t.loginTitle}</h2><p className="mt-3 text-sm leading-6 text-neutral-500">{t.loginHelp}</p>
    {!configured && <p role="status" className="notice mt-4">{t.notConfigured}</p>}
    <form onSubmit={submit} className="mt-6 space-y-5">
      <label className="field-label">{t.email}<input name="email" type="email" autoComplete="username" required maxLength={254} className="input mt-2" /></label>
      <label className="field-label">{t.password}<input name="password" type="password" autoComplete="current-password" required className="input mt-2" /></label>
      {error && <p role="alert" className="error">{error}</p>}
      <button className="primary w-full" disabled={busy || !configured}>{busy ? t.loginBusy : t.signIn}</button>
    </form>
    <p className="mt-5 text-xs leading-6 text-neutral-500">{t.memberOnly}</p>
  </section>
}
