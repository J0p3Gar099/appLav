/**
 * UTILS / export.utils.ts
 *
 * Exportación de datos a CSV y Excel (.xlsx) sin dependencias extra.
 *
 * Para Excel usamos el formato SYLK simplificado ó el truco de
 * data URI con el mime type de Excel — soportado en todos los
 * navegadores modernos y abre en Excel / LibreOffice / Numbers.
 *
 * Para un .xlsx real (con estilos) se necesitaría la lib SheetJS;
 * aquí generamos un CSV con extensión .csv que Excel abre nativamente.
 *
 * Incluimos BOM UTF-8 (0xFEFF) para que Excel en Windows no
 * muestre caracteres rotos con acentos y ñ.
 */

import type { Order }          from '@/models/order.model'
import type { OperationalCost } from '@/models/cost.model'

// ── helpers ───────────────────────────────────────────────────

const BOM = '\uFEFF'

/** Escapa un valor para CSV: rodea con comillas si tiene comas/saltos */
function esc(val: string | number | boolean | undefined | null): string {
  if (val === undefined || val === null) return ''
  const s = String(val)
  if (s.includes(',') || s.includes('\n') || s.includes('"')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function row(cells: (string | number | boolean | undefined | null)[]): string {
  return cells.map(esc).join(',')
}

function formatDate(iso: string | undefined): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function formatDateTime(iso: string | undefined): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function download(filename: string, content: string, mime = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mime })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const SERVICE_LABELS: Record<string, string> = {
  LAVADO: 'Lavado', SECADO: 'Secado', COMPLETO: 'Completo', ENCARGO: 'Por encargo',
}
const STATUS_LABELS: Record<string, string> = {
  CREADO: 'Creado', LAVANDO: 'Lavando', LISTO: 'Listo', ENTREGADO: 'Entregado',
}
const DELIVERY_LABELS: Record<string, string> = {
  SUCURSAL: 'Sucursal', DOMICILIO: 'Domicilio',
}
const PAYMENT_LABELS: Record<string, string> = {
  EFECTIVO: 'Efectivo', TRANSFERENCIA: 'Transferencia', TARJETA: 'Tarjeta',
}

// ── Exportar pedidos ──────────────────────────────────────────

const ORDER_HEADERS = [
  'ID Corto', 'Cliente', 'Servicio', 'Peso (kg)', 'Precio ($)',
  'Costo pedido ($)', 'Estado', 'Entrega', 'Pagado', 'Método pago',
  'Fecha prometida', 'Notas', 'Creado en',
]

function orderToRow(o: Order): (string | number | undefined)[] {
  return [
    o.id.replace(/-/g, '').slice(-6).toUpperCase(),
    o.customerName,
    SERVICE_LABELS[o.serviceType] ?? o.serviceType,
    o.weightKg,
    o.price,
    o.orderCost,
    STATUS_LABELS[o.status]    ?? o.status,
    DELIVERY_LABELS[o.deliveryType] ?? o.deliveryType,
    o.isPaid ? 'Sí' : 'No',
    o.paymentMethod ? (PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod) : '',
    o.promisedDate ? formatDate(o.promisedDate) : '',
    o.notes,
    formatDateTime(o.createdAt),
  ]
}

export function exportOrdersCSV(orders: Order[], filename = 'pedidos') {
  const lines = [
    row(ORDER_HEADERS),
    ...orders.map(o => row(orderToRow(o))),
  ]
  download(`${filename}.csv`, BOM + lines.join('\n'))
}

// ── Exportar costos ───────────────────────────────────────────

const COST_HEADERS = [
  'ID Corto', 'Descripción', 'Categoría', 'Monto ($)', 'Fecha', 'Registrado en',
]

function costToRow(c: OperationalCost): (string | number | undefined)[] {
  return [
    c.id.replace(/-/g, '').slice(-6).toUpperCase(),
    c.description,
    c.category,
    c.amount,
    formatDate(c.date),
    formatDateTime(c.createdAt),
  ]
}

export function exportCostsCSV(costs: OperationalCost[], filename = 'costos') {
  const lines = [
    row(COST_HEADERS),
    ...costs.map(c => row(costToRow(c))),
  ]
  download(`${filename}.csv`, BOM + lines.join('\n'))
}

// ── Exportar reporte combinado (pedidos + costos + resumen) ───

export function exportFullReportCSV(
  orders: Order[],
  costs: OperationalCost[],
  filename = 'reporte_lavanderia'
) {
  const totalIngresos = orders.filter(o => o.isPaid).reduce((s, o) => s + o.price, 0)
  const totalCostos   = costs.reduce((s, c) => s + c.amount, 0)
  const utilidad      = totalIngresos - totalCostos

  const sections = [
    '== RESUMEN ==',
    row(['Total pedidos', orders.length]),
    row(['Pedidos pagados', orders.filter(o => o.isPaid).length]),
    row(['Ingresos totales ($)', totalIngresos]),
    row(['Costos totales ($)', totalCostos]),
    row(['Utilidad ($)', utilidad]),
    '',
    '== PEDIDOS ==',
    row(ORDER_HEADERS),
    ...orders.map(o => row(orderToRow(o))),
    '',
    '== COSTOS OPERATIVOS ==',
    row(COST_HEADERS),
    ...costs.map(c => row(costToRow(c))),
  ]

  download(`${filename}.csv`, BOM + sections.join('\n'))
}
