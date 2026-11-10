import { colors, sheetUrl, officialUrl } from '../catalog'
import type { Text } from '../i18n'
import { Icon } from './Icon'
import { SpoolImage } from './SpoolImage'

export function Home({ t }: { t: Text }) {
  return <>
    <section className="pb-10 pt-5 sm:pb-12 sm:pt-10">
      <h1 className="max-w-4xl text-[2rem] font-bold leading-tight tracking-tight sm:text-[2.65rem]">{t.headline}</h1>
      <p className="mt-5 max-w-2xl text-[15px] leading-8 text-neutral-600 sm:text-base">{t.intro}</p>
    </section>
    <a href="#inventory" className="inventory-link group flex items-center gap-5 rounded border border-neutral-300 px-5 py-6 transition hover:border-black sm:px-7">
      <Icon name="table" className="h-8 w-8" /><div><h2 className="text-xl font-bold sm:text-2xl">{t.inventory}</h2><p className="mt-1 text-sm text-neutral-500">{t.inventoryDesc}</p></div><Icon name="arrow" className="ml-auto transition group-hover:translate-x-1" />
    </a>
    <a href={sheetUrl} target="_blank" rel="noreferrer" className="external-link mt-3"><Icon name="external" className="h-4 w-4" />{t.sheets}</a>
    <section className="mt-10 sm:mt-12">
      <h2 className="mb-4 border-b border-neutral-200 pb-4 text-xl font-bold sm:text-2xl">{t.forms}</h2>
      <div className="space-y-3">{(['add','use','transfer'] as const).map((kind, i) => <a key={kind} href={`#${kind}`} className="group flex min-h-24 items-center gap-4 rounded border border-neutral-200 px-4 py-4 transition hover:border-black sm:gap-6 sm:px-7">
        <span className="text-xl font-semibold tabular-nums sm:text-2xl">0{i + 1}</span>
        <span className="hidden border-l border-neutral-200 pl-6 sm:block"><Icon name={['plus','minus','swap'][i]} className="h-8 w-8" /></span>
        <div className="min-w-0"><h3 className="text-base font-bold sm:text-lg">{t[kind]}</h3><p className="mt-1 text-xs leading-5 text-neutral-500 sm:text-sm">{t[`${kind}Desc`]}</p></div>
        <Icon name="arrow" className="ml-auto h-5 w-5 transition group-hover:translate-x-1" />
      </a>)}</div>
    </section>
    <div className="mx-auto mt-6 flex max-w-xl items-center justify-center gap-2 sm:gap-8" aria-hidden="true">{['WHITE','BLACK','RED'].map(id => <div className="w-1/3" key={id}><SpoolImage color={colors.find(c => c.id === id)!} large /></div>)}</div>
    <a className="external-link justify-center text-xs" href={officialUrl} target="_blank" rel="noreferrer">{t.official}<Icon name="external" className="h-3 w-3" /></a>
  </>
}
