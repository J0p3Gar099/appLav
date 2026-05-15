/**
 * HOOKS / useUrgency.ts
 *
 * Calcula el nivel de urgencia de un pedido según su fecha prometida
 * y su estado actual.
 *
 * Reglas:
 *   - Pedidos ENTREGADO         → 'none'    (ya terminó)
 *   - Sin fecha prometida       → 'none'
 *   - Faltan > 24 h             → 'ok'      🟢
 *   - Faltan 0–24 h             → 'soon'    🟡
 *   - Ya venció (pasada)        → 'late'    🔴
 */
import type { Order, UrgencyLevel } from '@/models/order.model'

export interface UrgencyInfo {
  level: UrgencyLevel
  label: string
  hoursLeft: number | null   // negativo = vencido
  dotClass: string           // clases Tailwind para el semáforo
  textClass: string
  bgClass: string
}

const INFO: Record<UrgencyLevel, Omit<UrgencyInfo, 'level' | 'label' | 'hoursLeft'>> = {
  none: { dotClass: '',                                          textClass: 'text-slate-500',   bgClass: '' },
  ok:   { dotClass: 'bg-emerald-400 shadow-[0_0_6px_#34d399]', textClass: 'text-emerald-400',  bgClass: 'bg-emerald-500/10 border-emerald-500/20' },
  soon: { dotClass: 'bg-amber-400   shadow-[0_0_6px_#fbbf24]', textClass: 'text-amber-400',    bgClass: 'bg-amber-500/10   border-amber-500/20'   },
  late: { dotClass: 'bg-red-500     shadow-[0_0_6px_#ef4444]', textClass: 'text-red-400',      bgClass: 'bg-red-500/10     border-red-500/20'      },
}

export function getUrgency(order: Order): UrgencyInfo {
  if (order.status === 'ENTREGADO' || !order.promisedDate) {
    return { level: 'none', label: '', hoursLeft: null, ...INFO.none }
  }

  const now        = Date.now()
  const deadline   = new Date(order.promisedDate).getTime()
  // Añadimos 23:59 al día prometido para que venza al final del día
  const deadlineEod = deadline + 24 * 60 * 60 * 1000 - 1
  const hoursLeft  = Math.round((deadlineEod - now) / (1000 * 60 * 60))

  let level: UrgencyLevel
  let label: string

  if (hoursLeft < 0) {
    level = 'late'
    const overdue = Math.abs(hoursLeft)
    label = overdue < 24
      ? `Venció hace ${overdue}h`
      : `Venció hace ${Math.ceil(overdue / 24)}d`
  } else if (hoursLeft <= 24) {
    level = 'soon'
    label = hoursLeft < 1 ? 'Vence hoy' : `Vence en ${hoursLeft}h`
  } else {
    level = 'ok'
    const daysLeft = Math.ceil(hoursLeft / 24)
    label = daysLeft === 1 ? 'Vence mañana' : `${daysLeft} días`
  }

  return { level, label, hoursLeft, ...INFO[level] }
}

/** Versión React hook para usar en componentes */
export function useUrgency(order: Order): UrgencyInfo {
  return getUrgency(order)
}
