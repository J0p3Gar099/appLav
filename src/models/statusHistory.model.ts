/**
 * MODELS / statusHistory.model.ts
 *
 * Registro de cambios de estado de pedidos.
 */

import type { OrderStatus } from './order.model'

export interface StatusHistoryEntry {
  id: string
  orderId: string
  customerName: string
  fromStatus: OrderStatus | null  // null si es el estado inicial
  toStatus: OrderStatus
  changedBy: string       // userId
  changedByName: string   // displayName
  changedAt: string       // ISO
}
