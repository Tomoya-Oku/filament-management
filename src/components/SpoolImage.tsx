import { useState } from 'react'
import type { Color } from '../catalog'

export function SpoolImage({ color, large = false }: { color: Color; large?: boolean }) {
  const [failed, setFailed] = useState(false)
  return color.image && !failed
    ? <span className="relative block w-full"><img src={color.image} alt="" width={large ? 240 : 100} height={large ? 240 : 100} loading="lazy" decoding="async" onError={() => setFailed(true)} className="aspect-square w-full object-contain" /><span aria-hidden="true" className="absolute bottom-1 right-1 h-5 w-5 rounded-full border border-neutral-300 ring-2 ring-white" style={{ backgroundColor:color.hex }} /></span>
    : <span aria-hidden="true" className="m-auto block h-12 w-12 rounded-full border border-neutral-300" style={{ backgroundColor: color.hex }} />
}
