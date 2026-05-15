/**
 * PAGES / CustomerHistoryPage.tsx — versión responsiva
 * Ruta: /customers/:customerId/history
 */
import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCustomers } from '@/context/CustomerContext'
import { useOrders } from '@/context/OrderContext'
import type { OrderStatus } from '@/models/order.model'

const STATUS_COLOR: Record<OrderStatus, string> = {
  CREADO:    'bg-slate-700/80 text-slate-300 border-slate-600',
  LAVANDO:   'bg-blue-500/25 text-blue-300 border-blue-500/30',
  LISTO:     'bg-emerald-500/25 text-emerald-300 border-emerald-500/30',
  ENTREGADO: 'bg-slate-600/20 text-slate-400 border-slate-700',
}

const SERVICE_LABEL: Record<string, string> = {
  LAVADO: 'Lavado', SECADO: 'Secado', COMPLETO: 'Completo', ENCARGO: 'Por encargo',
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })

export const CustomerHistoryPage = () => {
  const { customerId } = useParams<{ customerId: string }>()
  const navigate = useNavigate()
  const { getCustomerById } = useCustomers()
  const { orders } = useOrders()

  const customer = customerId ? getCustomerById(customerId) : undefined

  const customerOrders = useMemo(() =>
    orders
      .filter(o => o.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders, customerId]
  )

  const stats = useMemo(() => ({
    total:      customerOrders.length,
    totalSpent: customerOrders.reduce((s, o) => s + o.price, 0),
    delivered:  customerOrders.filter(o => o.status === 'ENTREGADO').length,
    pending:    customerOrders.filter(o => o.status !== 'ENTREGADO').length,
  }), [customerOrders])

  if (!customer) {
    return (
      <div className="text-center py-24 space-y-3">
        <p className="text-4xl">👤</p>
        <p className="text-slate-400">Cliente no encontrado</p>
        <button onClick={() => navigate('/customers')}
          className="text-indigo-400 text-sm hover:underline">← Volver</button>
      </div>
    )
  }

  const activeOrder = customerOrders.find(o => o.status !== 'ENTREGADO')

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Volver */}
      <button onClick={() => navigate('/customers')}
        className="text-slate-500 hover:text-slate-300 text-sm flex items-center gap-1.5 transition-colors">
        ← Clientes
      </button>

      {/* Perfil */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/20
          flex items-center justify-center text-2xl font-bold text-indigo-300 shrink-0">
          {customer.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white truncate">{customer.name}</h1>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs sm:text-sm text-slate-500 mt-0.5">
            {customer.phone   && <span>📞 {customer.phone}</span>}
            {customer.address && <span className="truncate">📍 {customer.address}</span>}
          </div>
        </div>
      </div>

      {/* Stats — 2 col móvil, 4 col desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {[
          { label: 'Pedidos',    value: stats.total,                     icon: '🧺' },
          { label: 'Gastado',    value: `$${stats.totalSpent.toFixed(0)}`, icon: '💰' },
          { label: 'Entregados', value: stats.delivered,                 icon: '✅' },
          { label: 'En proceso', value: stats.pending,                   icon: '⏳' },
        ].map(s => (
          <div key={s.label}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 sm:px-4 py-3">
            <p className="text-lg sm:text-xl mb-0.5">{s.icon}</p>
            <p className="text-lg sm:text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pedido activo destacado */}
      {activeOrder && (
        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl px-4 py-3
          flex items-center gap-3">
          <span className="text-xl shrink-0">🔔</span>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium">Pedido activo</p>
            <p className="text-slate-400 text-xs mt-0.5 truncate">
              {SERVICE_LABEL[activeOrder.serviceType]} · {fmt(activeOrder.createdAt)}
              {activeOrder.promisedDate && ` · entrega: ${fmt(activeOrder.promisedDate)}`}
            </p>
          </div>
          <span className={`text-[10px] px-2 py-1 rounded-full font-medium shrink-0
            border ${STATUS_COLOR[activeOrder.status]}`}>
            {activeOrder.status}
          </span>
        </div>
      )}

      {/* Historial */}
      <div>
        <h2 className="text-white font-semibold mb-3 text-sm sm:text-base">Historial de pedidos</h2>
        {customerOrders.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl py-12 text-center">
            <p className="text-3xl mb-2">🧺</p>
            <p className="text-slate-500 text-sm">Sin pedidos aún</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[19px] top-3 bottom-3 w-px bg-slate-800" />
            <div className="space-y-3">
              {customerOrders.map((order, idx) => (
                <div key={order.id} className="flex gap-3 sm:gap-4">
                  {/* Dot timeline */}
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center
                    shrink-0 z-10 text-sm
                    ${order.status === 'ENTREGADO'
                      ? 'bg-slate-800 border-slate-700 text-slate-600'
                      : idx === 0
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
                    {order.status === 'ENTREGADO' ? '✓' : idx === 0 ? '●' : '○'}
                  </div>

                  {/* Tarjeta */}
                  <div className={`flex-1 min-w-0 bg-slate-900 border rounded-xl px-3 sm:px-4 py-3 mb-1
                    ${order.status === 'ENTREGADO' ? 'border-slate-800/50 opacity-60' : 'border-slate-800'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white text-sm font-medium">
                            {SERVICE_LABEL[order.serviceType]}
                            {order.weightKg ? ` — ${order.weightKg}kg` : ''}
                          </p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border
                            ${STATUS_COLOR[order.status]}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-2 sm:gap-x-3 text-xs text-slate-500 mt-1">
                          <span>{fmt(order.createdAt)}</span>
                          {order.promisedDate && (
                            <span className="hidden sm:inline">📅 {fmt(order.promisedDate)}</span>
                          )}
                          <span>{order.deliveryType === 'DOMICILIO' ? '🛵' : '🏪'}</span>
                        </div>
                        {order.notes && (
                          <p className="text-xs text-slate-600 italic mt-1 truncate">"{order.notes}"</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-white font-semibold text-sm">${order.price}</p>
                        <p className={`text-xs mt-0.5 ${order.isPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {order.isPaid ? '✓ Pagado' : '⏳ Pend.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
