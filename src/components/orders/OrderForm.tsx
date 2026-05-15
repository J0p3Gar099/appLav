import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOrders } from '@/context/OrderContext'
import { useCustomers } from '@/context/CustomerContext'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuth } from '@/context/AuthContext'
import type { Order, ServiceType, PaymentMethod, DeliveryType } from '@/models/order.model'

interface Props { order?: Order; onClose: () => void }

const inputClass = "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
const labelClass = "block text-xs font-medium text-slate-400 mb-1.5"

// Fecha mínima = hoy (no se puede prometer para el pasado)
const todayISO = () => new Date().toISOString().split('T')[0]

export const OrderForm = ({ order, onClose }: Props) => {
  const { addOrder, updateOrder } = useOrders()
  const { customers }             = useCustomers()
  const { isAdmin }               = usePermissions()
  const { user }                  = useAuth()
  const isEditing = !!order
  const isLocked  = order?.status === 'ENTREGADO'

  const [customerId,     setCustomerId]     = useState(order?.customerId ?? '')
  const [serviceType,    setServiceType]    = useState<ServiceType>(order?.serviceType ?? 'LAVADO')
  const [weightKg,       setWeightKg]       = useState(order?.weightKg?.toString() ?? '')
  const [price,          setPrice]          = useState(order?.price?.toString() ?? '')
  const [orderCost,      setOrderCost]      = useState(order?.orderCost?.toString() ?? '')
  const [deliveryType,   setDeliveryType]   = useState<DeliveryType>(order?.deliveryType ?? 'SUCURSAL')
  const [isPaid,         setIsPaid]         = useState(order?.isPaid ?? false)
  const [paymentMethod,  setPaymentMethod]  = useState<PaymentMethod>(order?.paymentMethod ?? 'EFECTIVO')
  const [notes,          setNotes]          = useState(order?.notes ?? '')
  const [promisedDate,   setPromisedDate]   = useState(order?.promisedDate ?? '')
  const [error,          setError]          = useState('')

  const selectedCustomer = customers.find(c => c.id === customerId)

  const validate = (): boolean => {
    if (!customerId) return setError('Selecciona un cliente'), false
    if (serviceType === 'ENCARGO' && (!weightKg || Number(weightKg) <= 0))
      return setError('Ingresa el peso para servicio por encargo'), false
    if (isAdmin && (!price || Number(price) <= 0))
      return setError('El precio debe ser mayor a 0'), false
    if (orderCost && Number(orderCost) < 0)
      return setError('El costo no puede ser negativo'), false
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isLocked) return
    if (!validate()) return

    const data = {
      customerId,
      customerName:  selectedCustomer?.name ?? '',
      serviceType,
      weightKg:      serviceType === 'ENCARGO' ? Number(weightKg) : undefined,
      price:         isAdmin ? Number(price) : (order?.price ?? 0),
      orderCost:     orderCost ? Number(orderCost) : undefined,
      deliveryType,
      isPaid,
      paymentMethod: isPaid ? paymentMethod : undefined,
      status:        order?.status ?? 'CREADO' as const,
      notes:         notes.trim() || undefined,
      promisedDate:  promisedDate || undefined,
    }

    if (isEditing && order) updateOrder({ ...order, ...data })
    else addOrder(data)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          className="bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl max-h-[90vh] flex flex-col"
          initial={{ y: 60, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
            <div>
              <h2 className="font-semibold text-white">{isEditing ? 'Editar pedido' : 'Nuevo pedido'}</h2>
              {isLocked && <p className="text-xs text-amber-400 mt-0.5">🔒 Pedido entregado — solo lectura</p>}
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-lg">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
            <div className="p-6 space-y-4">
              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">
                  {error}
                </motion.p>
              )}

              {/* Cliente */}
              <div>
                <label className={labelClass}>Cliente *</label>
                {customers.length === 0 ? (
                  <p className="text-amber-400 text-xs bg-amber-500/10 px-3 py-2 rounded-lg">
                    No hay clientes. Ve a Clientes para agregar uno.
                  </p>
                ) : (
                  <select value={customerId} onChange={e => { setCustomerId(e.target.value); setError('') }}
                    className={inputClass} disabled={isLocked}>
                    <option value="">Seleccionar cliente...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}{c.phone ? ` — ${c.phone}` : ''}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Servicio + Entrega */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Servicio *</label>
                  <select value={serviceType} onChange={e => setServiceType(e.target.value as ServiceType)}
                    className={inputClass} disabled={isLocked}>
                    <option value="LAVADO">Lavado</option>
                    <option value="SECADO">Secado</option>
                    <option value="COMPLETO">Completo</option>
                    <option value="ENCARGO">Por encargo</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Entrega *</label>
                  <select value={deliveryType} onChange={e => setDeliveryType(e.target.value as DeliveryType)}
                    className={inputClass} disabled={isLocked}>
                    <option value="SUCURSAL">🏪 Sucursal</option>
                    <option value="DOMICILIO">🛵 Domicilio</option>
                  </select>
                </div>
              </div>

              {/* Peso */}
              {serviceType === 'ENCARGO' && (
                <div>
                  <label className={labelClass}>Peso (kg) *</label>
                  <input type="number" min="0.5" step="0.5" value={weightKg}
                    onChange={e => setWeightKg(e.target.value)}
                    placeholder="ej: 3.5" className={inputClass} disabled={isLocked} />
                </div>
              )}

              {/* ── Fecha prometida de entrega ── */}
              <div>
                <label className={labelClass}>
                  Fecha prometida de entrega
                  <span className="ml-1.5 text-slate-600 font-normal">opcional</span>
                </label>
                <input
                  type="date"
                  value={promisedDate}
                  min={todayISO()}
                  onChange={e => setPromisedDate(e.target.value)}
                  className={inputClass}
                  disabled={isLocked}
                />
                <p className="text-xs text-slate-600 mt-1">
                  Activa el semáforo de urgencia en la lista de pedidos
                </p>
              </div>

              {/* Precio — admin */}
              {isAdmin && (
                <div>
                  <label className={labelClass}>Precio ($) *</label>
                  <input type="number" min="1" value={price} onChange={e => setPrice(e.target.value)}
                    placeholder="0.00" className={inputClass} disabled={isLocked} />
                </div>
              )}

              {/* Costo del pedido */}
              <div>
                <label className={labelClass}>
                  Costo del pedido ($)
                  <span className="ml-1.5 text-slate-600 font-normal">opcional</span>
                </label>
                <input type="number" min="0" step="0.5" value={orderCost}
                  onChange={e => setOrderCost(e.target.value)}
                  placeholder="ej: 45.00" className={inputClass} disabled={isLocked} />
              </div>

              {/* Pago */}
              <div className="flex items-center gap-3">
                <input type="checkbox" id="isPaid" checked={isPaid}
                  onChange={e => setIsPaid(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500" disabled={isLocked} />
                <label htmlFor="isPaid" className="text-sm text-slate-300">Pagado</label>
              </div>
              {isPaid && (
                <div>
                  <label className={labelClass}>Método de pago</label>
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    className={inputClass} disabled={isLocked}>
                    <option value="EFECTIVO">💵 Efectivo</option>
                    <option value="TRANSFERENCIA">🏦 Transferencia</option>
                    <option value="TARJETA">💳 Tarjeta</option>
                  </select>
                </div>
              )}

              {/* Notas */}
              <div>
                <label className={labelClass}>Notas (opcional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Instrucciones especiales…" rows={2}
                  className={`${inputClass} resize-none`} disabled={isLocked} />
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-400 text-sm hover:bg-slate-800 transition-colors">
                {isLocked ? 'Cerrar' : 'Cancelar'}
              </button>
              {!isLocked && (
                <button type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
                  {isEditing ? 'Guardar cambios' : 'Crear pedido'}
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
