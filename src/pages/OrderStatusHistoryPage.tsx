/**
 * PAGES / OrderStatusHistoryPage.tsx
 *
 * Muestra el historial completo de cambios de estado de un pedido.
 * Solo accesible para admin.
 */
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStatusHistory } from '@/context/StatusHistoryContext'
import { useOrders } from '@/context/OrderContext'
import type { OrderStatus } from '@/models/order.model'

const STATUS_META: Record<OrderStatus, { label: string; color: string; icon: string }> = {
  CREADO:    { label: 'Creado',    color: 'bg-slate-700 text-slate-300',           icon: '📝' },
  LAVANDO:   { label: 'Lavando',   color: 'bg-blue-500/20 text-blue-400',          icon: '🫧' },
  LISTO:     { label: 'Listo',     color: 'bg-emerald-500/20 text-emerald-400',    icon: '✅' },
  ENTREGADO: { label: 'Entregado', color: 'bg-purple-500/20 text-purple-400',      icon: '📦' },
}

export function OrderStatusHistoryPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { getEntriesForOrder } = useStatusHistory()
  const { getOrderById } = useOrders()

  const order   = orderId ? getOrderById(orderId) : undefined
  const entries = orderId ? getEntriesForOrder(orderId) : []

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/orders')}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Historial de estados</h1>
          {order && (
            <p className="text-sm text-slate-400">
              Pedido de <span className="text-slate-200 font-medium">{order.customerName}</span>
              {' · '}
              <span className="text-slate-500 text-xs">
                Creado {new Date(order.createdAt).toLocaleDateString('es-MX', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Payment info block */}
      {order?.isPaid && (
        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-emerald-400 text-lg">💳</span>
          <div>
            <p className="text-sm text-emerald-400 font-medium">Pagado</p>
            {order.paidByName && (
              <p className="text-xs text-slate-400">
                Por <span className="text-slate-200">{order.paidByName}</span>
                {order.paidAt && (
                  <> · {new Date(order.paidAt).toLocaleString('es-MX', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</>
                )}
              </p>
            )}
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm">No hay cambios de estado registrados para este pedido.</p>
          <p className="text-xs mt-1 text-slate-600">Los cambios futuros aparecerán aquí.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Línea vertical del timeline */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-700" />

          <div className="space-y-4">
            {entries.map((entry, idx) => {
              const toMeta   = STATUS_META[entry.toStatus]
              const fromMeta = entry.fromStatus ? STATUS_META[entry.fromStatus] : null
              const date     = new Date(entry.changedAt)

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative flex gap-4"
                >
                  {/* Dot del timeline */}
                  <div className={`
                    relative z-10 flex-shrink-0 w-10 h-10 rounded-full
                    flex items-center justify-center text-lg
                    border-2 border-slate-800 bg-slate-900
                  `}>
                    {toMeta.icon}
                  </div>

                  {/* Card */}
                  <div className="flex-1 bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {fromMeta && (
                          <>
                            <span className={`text-xs px-2 py-1 rounded-lg font-medium ${fromMeta.color}`}>
                              {fromMeta.label}
                            </span>
                            <span className="text-slate-600 text-sm">→</span>
                          </>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium ${toMeta.color}`}>
                          {toMeta.label}
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-slate-300 font-medium">
                          {date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-xs text-slate-500">
                          {date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Por <span className="text-slate-400">{entry.changedByName}</span>
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
