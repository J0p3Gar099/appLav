/**
 * UrgencyBadge — semáforo visual de urgencia de entrega.
 *
 * Variantes:
 *   dot   — solo el punto parpadeante (para listas compactas)
 *   badge — punto + etiqueta de texto (para cards y detail views)
 */
import { getUrgency } from '@/hooks/useUrgency'
import type { Order } from '@/models/order.model'

interface Props {
  order: Order
  variant?: 'dot' | 'badge'
}

export const UrgencyBadge = ({ order, variant = 'badge' }: Props) => {
  const u = getUrgency(order)
  if (u.level === 'none') return null

  if (variant === 'dot') {
    return (
      <span
        title={u.label}
        className={`inline-block w-2 h-2 rounded-full shrink-0 ${u.dotClass}
          ${u.level !== 'ok' ? 'animate-pulse' : ''}`}
      />
    )
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5
      rounded-full border ${u.bgClass} ${u.textClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${u.dotClass}
        ${u.level !== 'ok' ? 'animate-pulse' : ''}`} />
      {u.label}
    </span>
  )
}
