/**
 * PAGES / OrdersPage.tsx
 *
 * Lista, filtra y gestiona los pedidos de la lavandería.
 *
 * Mejoras incluidas:
 *   - Filtros de tiempo: Hoy / Esta semana / Este mes
 *   - Buscador por nombre de cliente o notas
 *   - Atajo de teclado: P → nuevo pedido, C → nuevo cliente
 *   - Toast inmediato al cambiar pedido a LISTO
 *   - Notificación nativa del navegador (notifyReadyOrder)
 *   - Recordatorios automáticos cada 5 min via useReadyReminders
 */
import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useOrders } from '@/context/OrderContext'
import { useCustomers } from '@/context/CustomerContext'
import { useAuth } from '@/context/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'
import { useReadyReminders } from '@/hooks/useReadyReminders'
import { OrderForm } from '@/components/orders/OrderForm'
import { PrintLabelModal } from '@/components/orders/PrintLabelModal'
import { UrgencyBadge } from '@/components/orders/UrgencyBadge'
import { Toast } from '@/components/ui/Toast'
import { exportOrdersCSV } from '@/utils/export.utils'
import { notifyReadyOrder, notifyPendingReminder } from '@/utils/notify.utils'
import { getUrgency } from '@/hooks/useUrgency'
import type { Order, OrderStatus } from '@/models/order.model'

// ── Constantes ────────────────────────────────────────────────

const STATUS_OPTIONS: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'CREADO',    label: 'Creado',    color: 'bg-slate-700 text-slate-300' },
  { value: 'LAVANDO',   label: 'Lavando',   color: 'bg-blue-500/20 text-blue-400' },
  { value: 'LISTO',     label: 'Listo',     color: 'bg-emerald-500/20 text-emerald-400' },
  { value: 'ENTREGADO', label: 'Entregado', color: 'bg-slate-600/30 text-slate-500' },
]

const SERVICE_LABELS: Record<string, string> = {
  LAVADO: 'Lavado', SECADO: 'Secado', COMPLETO: 'Completo', ENCARGO: 'Por encargo',
}

type TimeFilter = 'ALL' | 'TODAY' | 'WEEK' | 'MONTH'

// ── Helpers de tiempo ─────────────────────────────────────────

function startOfDay(d = new Date()) {
  const r = new Date(d); r.setHours(0, 0, 0, 0); return r
}
function startOfWeek(d = new Date()) {
  const r = startOfDay(d)
  r.setDate(r.getDate() - (r.getDay() === 0 ? 6 : r.getDay() - 1))
  return r
}
function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function matchesTimeFilter(order: Order, filter: TimeFilter): boolean {
  if (filter === 'ALL') return true
  const date = new Date(order.createdAt)
  const now = new Date()
  if (filter === 'TODAY') return date >= startOfDay(now)
  if (filter === 'WEEK')  return date >= startOfWeek(now)
  if (filter === 'MONTH') return date >= startOfMonth(now)
  return true
}

// ── Toast state ───────────────────────────────────────────────

interface ToastState { message: string; type: 'success' | 'error'; key: number }

// ── Page ──────────────────────────────────────────────────────

export const OrdersPage = () => {
  const navigate = useNavigate()

  const [showForm,      setShowForm]      = useState(false)
  const [editingOrder,  setEditingOrder]  = useState<Order | null>(null)
  const [printOrder,    setPrintOrder]    = useState<Order | null>(null)
  const [filterStatus,  setFilterStatus]  = useState<OrderStatus | 'ALL'>('ALL')
  const [timeFilter,    setTimeFilter]    = useState<TimeFilter>('ALL')
  const [sortByUrgency, setSortByUrgency] = useState(false)
  const [search,        setSearch]        = useState('')
  const [toast,         setToast]         = useState<ToastState | null>(null)

  const searchRef = useRef<HTMLInputElement>(null)

  const { orders, updateOrder, deleteOrder } = useOrders()
  const { customers }  = useCustomers()
  const { user }         = useAuth()
  const { isAdmin }      = usePermissions()

  // ── Atajo de teclado: P → pedido, C → cliente ─────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // No disparar si el foco está en un input/textarea/select
      const tag = (e.target as HTMLElement).tagName
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return

      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        setShowForm(true)
        setEditingOrder(null)
      }
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault()
        navigate('/customers')
        // Pequeño delay para que la página cargue y luego abra el modal
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('open-new-customer'))
        }, 100)
      }
      if (e.key === '/') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate])

  // ── Recordatorios ─────────────────────────────────────────
  const handleRemind = useCallback((pending: Order[]) => {
    const msg = pending.length === 1
      ? `⏰ ${pending[0].customerName} lleva más de 30 min esperando recoger`
      : `⏰ ${pending.length} pedidos llevan más de 30 min sin ser recogidos`
    setToast(prev => ({ message: msg, type: 'error', key: (prev?.key ?? 0) + 1 }))
    notifyPendingReminder(pending)
  }, [])

  useReadyReminders({ orders, thresholdMinutes: 30, onRemind: handleRemind })

  // ── Filtros combinados ────────────────────────────────────
  const canModify = (order: Order) =>
    order.status !== 'ENTREGADO' && (isAdmin || order.createdBy === user?.id)

  let filtered = orders
    .filter(o => filterStatus === 'ALL' || o.status === filterStatus)
    .filter(o => matchesTimeFilter(o, timeFilter))
    .filter(o => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        o.customerName.toLowerCase().includes(q) ||
        (o.notes ?? '').toLowerCase().includes(q) ||
        SERVICE_LABELS[o.serviceType].toLowerCase().includes(q)
      )
    })

  if (sortByUrgency) {
    const urgencyOrder = { late: 0, soon: 1, ok: 2, none: 3 }
    filtered = [...filtered].sort((a, b) =>
      urgencyOrder[getUrgency(a).level] - urgencyOrder[getUrgency(b).level]
    )
  }

  // ── Cambio de estado con notificación ────────────────────
  const handleStatusChange = (order: Order, status: OrderStatus) => {
    if (order.status === 'ENTREGADO') return
    updateOrder({ ...order, status })
    if (status === 'LISTO') {
      setToast(prev => ({
        message: `✅ Pedido de ${order.customerName} está listo para recoger`,
        type: 'success',
        key: (prev?.key ?? 0) + 1,
      }))
      notifyReadyOrder(order)
    }
  }

  const handleExport = () => {
    const label = filterStatus === 'ALL' ? 'todos' : filterStatus.toLowerCase()
    exportOrdersCSV(filtered, `pedidos_${label}`)
  }

  const lateCount = orders.filter(o => getUrgency(o).level === 'late').length
  const soonCount = orders.filter(o => getUrgency(o).level === 'soon').length

  const itemVariants = {
    hidden:  { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 30 } },
    exit:    { opacity: 0, x: -20, transition: { duration: 0.18 } },
  }

  return (
    <motion.div
      className="space-y-5 max-w-5xl mx-auto"
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {toast && (
        <Toast key={toast.key} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Pedidos</h1>
          <p className="text-slate-500 text-sm">
            {orders.length} pedido{orders.length !== 1 ? 's' : ''}
            {lateCount > 0 && <span className="ml-2 text-red-400 font-medium">· {lateCount} vencido{lateCount > 1 ? 's' : ''}</span>}
            {soonCount > 0 && <span className="ml-1 text-amber-400 font-medium">· {soonCount} por vencer</span>}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700
              border border-slate-700 text-slate-300 text-sm rounded-lg transition-colors">
            📥 Exportar CSV
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setShowForm(true); setEditingOrder(null) }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500
              text-white text-sm font-medium rounded-lg transition-colors">
            ➕ Nuevo pedido
            <kbd className="hidden sm:inline text-[10px] bg-indigo-700 px-1.5 py-0.5 rounded font-mono opacity-70">P</kbd>
          </motion.button>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
        <input
          ref={searchRef}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por cliente, servicio o nota…"
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5
            text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs">
            ✕
          </button>
        )}
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 font-mono hidden sm:block pointer-events-none">
          {search ? '' : '/'}
        </kbd>
      </div>

      {/* Filtros de tiempo */}
      <div className="flex items-center gap-2 flex-wrap">
        {([
          { value: 'ALL',   label: 'Todos' },
          { value: 'TODAY', label: 'Hoy' },
          { value: 'WEEK',  label: 'Esta semana' },
          { value: 'MONTH', label: 'Este mes' },
        ] as { value: TimeFilter; label: string }[]).map(f => (
          <button key={f.value} onClick={() => setTimeFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
              ${timeFilter === f.value ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            {f.label}
          </button>
        ))}
        <div className="w-px h-4 bg-slate-700 mx-1" />
        {/* Filtros de estado */}
        <button onClick={() => setFilterStatus('ALL')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
            ${filterStatus === 'ALL' ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-500 hover:text-white'}`}>
          Estado: Todos
        </button>
        {STATUS_OPTIONS.map(s => (
          <button key={s.value} onClick={() => setFilterStatus(s.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
              ${filterStatus === s.value ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            {s.label}
          </button>
        ))}
        <button onClick={() => setSortByUrgency(v => !v)}
          className={`ml-auto px-3 py-1.5 rounded-full text-xs font-medium transition-colors border
            ${sortByUrgency
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'}`}>
          🚦 Urgencia
        </button>
      </div>

      {/* Atajos de teclado hint */}
      <div className="flex gap-4 text-xs text-slate-600">
        <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-500">P</kbd> nuevo pedido</span>
        <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-500">C</kbd> nuevo cliente</span>
        <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-500">/</kbd> buscar</span>
      </div>

      {/* Resultados */}
      <p className="text-xs text-slate-600">
        {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        {search && ` para "${search}"`}
      </p>

      {/* Lista */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-slate-900 border border-slate-800 rounded-xl py-12 text-center">
          <p className="text-4xl mb-3">🧺</p>
          <p className="text-slate-500 text-sm">
            {search ? `Sin resultados para "${search}"` : 'No hay pedidos'}
          </p>
        </motion.div>
      ) : (
        <motion.div className="space-y-3"
          initial="hidden" animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
          key={`${filterStatus}-${timeFilter}-${search}`}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map(order => {
              const statusOpt = STATUS_OPTIONS.find(s => s.value === order.status)!
              const locked    = order.status === 'ENTREGADO'
              const mine      = order.createdBy === user?.id
              const urgency   = getUrgency(order)

              return (
                <motion.div key={order.id} variants={itemVariants} exit="exit" layout
                  className={`bg-slate-900 border rounded-xl p-4 transition-colors
                    ${locked ? 'border-slate-800/50 opacity-70' : 'border-slate-800 hover:border-slate-700'}
                    ${urgency.level === 'late' ? 'border-l-2 border-l-red-500/60' : ''}
                    ${urgency.level === 'soon' ? 'border-l-2 border-l-amber-500/60' : ''}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-white">{order.customerName}</p>
                        <UrgencyBadge order={order} variant="badge" />
                        {!isAdmin && mine && (
                          <span className="text-xs bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded">mi pedido</span>
                        )}
                        {locked && (
                          <span className="text-xs bg-slate-700/50 text-slate-500 px-1.5 py-0.5 rounded">🔒 cerrado</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-500">
                        <span>{SERVICE_LABELS[order.serviceType]}</span>
                        {order.weightKg && <span>{order.weightKg}kg</span>}
                        <span>{order.deliveryType === 'DOMICILIO' ? '🛵 Domicilio' : '🏪 Sucursal'}</span>
                        <span className="text-slate-600">
                          {new Date(order.createdAt).toLocaleDateString('es-MX', { day:'2-digit', month:'short' })}
                        </span>
                        {order.promisedDate && urgency.level === 'none' && (
                          <span>📅 {new Date(order.promisedDate).toLocaleDateString('es-MX', { day:'2-digit', month:'short' })}</span>
                        )}
                      </div>
                      {order.notes && (
                        <p className="text-xs text-slate-600 mt-1 italic truncate max-w-xs">📝 {order.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      {isAdmin && (
                        <div className="text-right">
                          <p className="text-white font-semibold">${order.price}</p>
                          {order.orderCost && <p className="text-xs text-slate-500">Costo: ${order.orderCost}</p>}
                          <p className={`text-xs ${order.isPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {order.isPaid ? '✓ Pagado' : '⏳ Pendiente'}
                          </p>
                        </div>
                      )}
                      {canModify(order) ? (
                        <select value={order.status}
                          onChange={e => handleStatusChange(order, e.target.value as OrderStatus)}
                          className={`text-xs px-2 py-1.5 rounded-lg border-0 font-medium cursor-pointer
                            focus:outline-none focus:ring-2 focus:ring-indigo-500 ${statusOpt.color}`}>
                          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      ) : (
                        <span className={`text-xs px-2 py-1.5 rounded-lg font-medium ${statusOpt.color}`}>
                          {statusOpt.label}
                        </span>
                      )}
                      <div className="flex gap-1">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={() => setPrintOrder(order)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                          title="Imprimir etiqueta">🏷️</motion.button>
                        {canModify(order) && (
                          <>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              onClick={() => { setEditingOrder(order); setShowForm(true) }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                              title="Editar">✏️</motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              onClick={() => { if (confirm('¿Eliminar este pedido?')) deleteOrder(order.id) }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                              title="Eliminar">🗑️</motion.button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {showForm && (
          <OrderForm order={editingOrder ?? undefined}
            onClose={() => { setShowForm(false); setEditingOrder(null) }} />
        )}
        {printOrder && (
          <PrintLabelModal order={printOrder} onClose={() => setPrintOrder(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
