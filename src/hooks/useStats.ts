/**
 * HOOKS / useStats.ts
 *
 * Calcula estadísticas de ingresos y pedidos a partir de las órdenes.
 * Separado en un hook para mantener DashboardPage limpio.
 * useMemo evita recalcular en cada render si las órdenes no cambiaron.
 */
import { useMemo } from 'react'
import type { Order } from '@/models/order.model'
import type { OperationalCost } from '@/models/cost.model'

const startOf = (unit: 'day' | 'week' | 'month'): Date => {
  const now = new Date()
  if (unit === 'day') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }
  if (unit === 'week') {
    const day = now.getDay() // 0=dom
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(now.getFullYear(), now.getMonth(), diff)
  }
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

const inRange = (dateStr: string, from: Date): boolean =>
  new Date(dateStr) >= from

const sumIncome = (orders: Order[], from: Date): number =>
  orders
    .filter(o => o.isPaid && inRange(o.createdAt, from))
    .reduce((acc, o) => acc + o.price, 0)

const sumCosts = (costs: OperationalCost[], from: Date): number =>
  costs
    .filter(c => inRange(c.date, from))
    .reduce((acc, c) => acc + c.amount, 0)

const countOrders = (orders: Order[], from: Date): number =>
  orders.filter(o => inRange(o.createdAt, from)).length

export function useStats(orders: Order[], costs: OperationalCost[]) {
  return useMemo(() => {
    const dayStart   = startOf('day')
    const weekStart  = startOf('week')
    const monthStart = startOf('month')

    return {
      income: {
        daily:   sumIncome(orders, dayStart),
        weekly:  sumIncome(orders, weekStart),
        monthly: sumIncome(orders, monthStart),
      },
      costs: {
        daily:   sumCosts(costs, dayStart),
        weekly:  sumCosts(costs, weekStart),
        monthly: sumCosts(costs, monthStart),
      },
      profit: {
        daily:   sumIncome(orders, dayStart)   - sumCosts(costs, dayStart),
        weekly:  sumIncome(orders, weekStart)  - sumCosts(costs, weekStart),
        monthly: sumIncome(orders, monthStart) - sumCosts(costs, monthStart),
      },
      orders: {
        daily:   countOrders(orders, dayStart),
        weekly:  countOrders(orders, weekStart),
        monthly: countOrders(orders, monthStart),
        pending: orders.filter(o => o.status !== 'ENTREGADO').length,
        unpaid:  orders.filter(o => !o.isPaid).length,
      },
    }
  }, [orders, costs])
}
