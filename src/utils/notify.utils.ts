/**
 * UTILS / notify.utils.ts
 *
 * Notificaciones del navegador (Web Notifications API).
 *
 * Flujo:
 *   1. Al iniciar sesión se pide permiso con requestNotifyPermission()
 *   2. Cuando un pedido pasa a LISTO se llama notifyReadyOrder()
 *   3. Si la pestaña está en segundo plano, aparece la notificación del SO
 *
 * Notas:
 *   - El tag `ready-{id}` evita duplicar notificaciones del mismo pedido
 *   - En HTTP (sin HTTPS) las notificaciones no funcionan en producción;
 *     en localhost sí funcionan en Chrome/Firefox/Edge
 */

import type { Order } from '@/models/order.model'

/** Solicita permiso al usuario si aún no lo ha dado. Llamar al hacer login. */
export async function requestNotifyPermission(): Promise<void> {
  if (!('Notification' in window)) return
  if (Notification.permission === 'default') {
    await Notification.requestPermission()
  }
}

/** Lanza una notificación nativa cuando un pedido queda listo. */
export function notifyReadyOrder(order: Order): void {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  const delivery = order.deliveryType === 'DOMICILIO'
    ? '🛵 Envío a domicilio'
    : '🏪 Recoger en sucursal'

  new Notification('🧺 Pedido listo para recoger', {
    body: `${order.customerName} — ${delivery}`,
    icon: '/favicon.ico',
    tag: `ready-${order.id}`,   // evita duplicados si se llama más de una vez
    requireInteraction: false,
  })
}

/** Lanza una notificación de recordatorio para varios pedidos sin recoger. */
export function notifyPendingReminder(orders: Order[]): void {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  if (orders.length === 0) return

  const body = orders.length === 1
    ? `${orders[0].customerName} lleva más de 30 min esperando`
    : `${orders.length} pedidos llevan más de 30 min sin ser recogidos`

  new Notification('⏰ Pedidos pendientes de entrega', {
    body,
    icon: '/favicon.ico',
    tag: 'pending-reminder',   // un solo recordatorio a la vez
    requireInteraction: false,
  })
}
