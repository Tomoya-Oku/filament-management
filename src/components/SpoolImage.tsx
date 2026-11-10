import { useState } from 'react'
import type { Color } from '../catalog'

export function SpoolImage({ color, large = false }: { color: Color; large?: boolean }) {
  const [failed, setFailed] = useState(false)
  return color.image && !failed
    ? <img src={`${color.image}__op__resize,m_lfit,w_${large ? 480 : 160}__op__format,f_auto__op__quality,q_80`} alt="" width={large ? 240 : 100} height={large ? 240 : 100} loading="lazy" decoding="async" onError={() => setFailed(true)} className="aspect-square w-full object-contain" />
    : <span aria-hidden="true" className="m-auto block h-12 w-12 rounded-full border border-neutral-300" style={{ backgroundColor: color.hex }} />
}
