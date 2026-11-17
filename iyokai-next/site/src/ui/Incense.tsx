import { cn } from '../lib/cn'

/**
 * L'incenso: una linea che si consuma. `left` va da 1 (intero) a 0 (finito).
 * È la firma del sito: conta l'attesa dell'intro e della scelta, e segna la sezione.
 */
export function Incense({ left, className }: { left: number; className?: string }) {
  const value = Math.max(0, Math.min(1, left))
  return (
    <div className={cn('incense', className)} aria-hidden="true">
      <div className="incense__burn" style={{ transform: `scaleY(${value})` }} />
      <div className="incense__ember" style={{ top: `calc(${(1 - value) * 100}% - 2px)` }} />
    </div>
  )
}
