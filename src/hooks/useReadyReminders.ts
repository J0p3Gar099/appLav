/**
 * HOOKS / useReadyReminders.ts
 *
 * Revisa periódicamente los pedidos en estado LISTO que llevan
 * más de `thresholdMinutes` sin ser recogidos y llama a `onRemind`.
 *
 * Correcciones respecto a la versión anterior:
 *   1. El intervalo se crea solo una vez (deps vacías). `orders` se lee
 *      siempre fresco desde un ref, así no se reinicia en cada render.
 *   2. El Set de notificados se limpia automáticamente para IDs que ya
 *      no están en LISTO (entregados, editados), evitando falsos negativos.
 *   3. thresholdMinutes se lee también desde un ref para que sea
 *      configurable sin destruir el intervalo.
 */

import { useEffect, useRef } from 'react'
import type { Order } from '@/models/order.model'

interface Options {
  orders: Order[]
  intervalMs?: number        // cada cuánto revisar (default: 5 min)
  thresholdMinutes?: number  // minutos en LISTO antes de recordar (default: 30)
  onRemind: (orders: Order[]) => void
}

export function useReadyReminders({
  orders,
  intervalMs = 5 * 60 * 1000,
  thresholdMinutes = 30,
  onRemind,
}: Options): void {
  // Refs para leer siempre el valor más fresco sin recrear el intervalo
  const ordersRef       = useRef(orders)
  const thresholdRef    = useRef(thresholdMinutes)
  const onRemindRef     = useRef(onRemind)
  const notifiedRef     = useRef<Set<string>>(new Set())

  // Mantener refs actualizados en cada render
  ordersRef.current    = orders
  thresholdRef.current = thresholdMinutes
  onRemindRef.current  = onRemind

  useEffect(() => {
    const check = () => {
      const now         = Date.now()
      const thresholdMs = thresholdRef.current * 60 * 1000
      const current     = ordersRef.current

      // Limpiar del Set los pedidos que ya no están en LISTO
      // (entregados o que volvieron a otro estado), para que si
      // en el futuro vuelven a LISTO se vuelvan a notificar
      const readyIds = new Set(current.filter(o => o.status === 'LISTO').map(o => o.id))
      for (const id of notifiedRef.current) {
        if (!readyIds.has(id)) notifiedRef.current.delete(id)
      }

      const pending = current.filter(o => {
        if (o.status !== 'LISTO') return false
        if (notifiedRef.current.has(o.id)) return false

        // Usar readyAt si existe; si no, createdAt como proxy
        const baseline = o.readyAt ?? o.createdAt
        const age      = now - new Date(baseline).getTime()
        return age >= thresholdMs
      })

      if (pending.length > 0) {
        pending.forEach(o => notifiedRef.current.add(o.id))
        onRemindRef.current(pending)
      }
    }

    check() // revisar al montar
    const id = setInterval(check, intervalMs)
    return () => clearInterval(id)

    // ⚠️ Solo intervalMs en deps: es el único parámetro que requiere
    // recrear el intervalo. El resto se lee desde refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs])
}
