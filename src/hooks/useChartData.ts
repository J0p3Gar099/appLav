/**
 * HOOKS / useChartData.ts
 *
 * Genera los datos para la gráfica de ingresos vs costos.
 * Soporta vista semanal (últimos 7 días) y mensual (últimas 4 semanas
 * o los días del mes actual según el tab activo).
 *
 * Retorna un array de puntos { label, ingresos, costos, utilidad }
 * listo para pasarle a Recharts.
 */
import { useMemo } from 'react'
import type { Order } from '@/models/order.model'
import type { OperationalCost } from '@/models/cost.model'

export interface ChartPoint {
  label: string      // "Lun", "Mar", "Sem 1", "Ene", etc.
  ingresos: number
  costos: number
  utilidad: number
}

// ── helpers ───────────────────────────────────────────────────

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                     'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function floorToDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r
}

// ── semana: últimos 7 días (hoy incluido) ─────────────────────
function buildWeekData(orders: Order[], costs: OperationalCost[]): ChartPoint[] {
  const today = floorToDay(new Date())
  return Array.from({ length: 7 }, (_, i) => {
    const day   = addDays(today, i - 6)
    const next  = addDays(day, 1)
    const label = DAY_NAMES[day.getDay()]

    const ingresos = orders
      .filter(o => o.isPaid && new Date(o.createdAt) >= day && new Date(o.createdAt) < next)
      .reduce((s, o) => s + o.price, 0)

    const costos = costs
      .filter(c => new Date(c.date) >= day && new Date(c.date) < next)
      .reduce((s, c) => s + c.amount, 0)

    return { label, ingresos, costos, utilidad: ingresos - costos }
  })
}

// ── mes: días del mes actual ──────────────────────────────────
function buildMonthData(orders: Order[], costs: OperationalCost[]): ChartPoint[] {
  const now        = new Date()
  const year       = now.getFullYear()
  const month      = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Agrupamos en semanas dentro del mes (1-7, 8-14, 15-21, 22-fin)
  const weeks = [
    { label: 'Sem 1', from: 1,  to: 7 },
    { label: 'Sem 2', from: 8,  to: 14 },
    { label: 'Sem 3', from: 15, to: 21 },
    { label: 'Sem 4', from: 22, to: daysInMonth },
  ]

  return weeks.map(({ label, from, to }) => {
    const start = new Date(year, month, from)
    const end   = new Date(year, month, to + 1)

    const ingresos = orders
      .filter(o => o.isPaid && new Date(o.createdAt) >= start && new Date(o.createdAt) < end)
      .reduce((s, o) => s + o.price, 0)

    const costos = costs
      .filter(c => new Date(c.date) >= start && new Date(c.date) < end)
      .reduce((s, c) => s + c.amount, 0)

    return { label, ingresos, costos, utilidad: ingresos - costos }
  })
}

// ── 6 meses: mes a mes ───────────────────────────────────────
function buildSixMonthData(orders: Order[], costs: OperationalCost[]): ChartPoint[] {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const monthOffset = i - 5
    const year  = now.getFullYear() + Math.floor((now.getMonth() + monthOffset) / 12)
    const month = ((now.getMonth() + monthOffset) % 12 + 12) % 12
    const start = new Date(year, month, 1)
    const end   = new Date(year, month + 1, 1)

    const ingresos = orders
      .filter(o => o.isPaid && new Date(o.createdAt) >= start && new Date(o.createdAt) < end)
      .reduce((s, o) => s + o.price, 0)

    const costos = costs
      .filter(c => new Date(c.date) >= start && new Date(c.date) < end)
      .reduce((s, c) => s + c.amount, 0)

    return { label: MONTH_NAMES[month], ingresos, costos, utilidad: ingresos - costos }
  })
}

// ── hook público ──────────────────────────────────────────────
export type ChartRange = 'week' | 'month' | '6months'

export function useChartData(
  orders: Order[],
  costs: OperationalCost[],
  range: ChartRange
): ChartPoint[] {
  return useMemo(() => {
    if (range === 'week')     return buildWeekData(orders, costs)
    if (range === 'month')    return buildMonthData(orders, costs)
    return buildSixMonthData(orders, costs)
  }, [orders, costs, range])
}
