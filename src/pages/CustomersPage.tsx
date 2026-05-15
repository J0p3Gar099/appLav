/**
 * PAGES / CustomersPage.tsx — versión responsiva
 *
 * Mejoras móvil:
 *  - Tarjeta en dos filas en pantallas pequeñas
 *  - Botones siempre visibles y con tamaño táctil adecuado
 *  - Historial accesible desde un botón pill debajo del nombre
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomers } from '@/context/CustomerContext'
import { useOrders } from '@/context/OrderContext'
import type { Customer } from '@/models/customer.model'

const inputClass = "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
const labelClass = "block text-xs font-medium text-slate-400 mb-1.5"

// ── Modal formulario ──────────────────────────────────────────

interface CustomerFormProps {
  customer?: Customer
  onSave: (data: Omit<Customer, 'id' | 'createdAt'>) => void
  onClose: () => void
}

const CustomerFormModal = ({ customer, onSave, onClose }: CustomerFormProps) => {
  const [name,    setName]    = useState(customer?.name    ?? '')
  const [phone,   setPhone]   = useState(customer?.phone   ?? '')
  const [address, setAddress] = useState(customer?.address ?? '')
  const [notes,   setNotes]   = useState(customer?.notes   ?? '')
  const [error,   setError]   = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('El nombre es obligatorio')
    onSave({
      name:    name.trim(),
      phone:   phone.trim()   || undefined,
      address: address.trim() || undefined,
      notes:   notes.trim()   || undefined,
    })
    onClose()
  }

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="font-semibold text-white">{customer ? 'Editar cliente' : 'Nuevo cliente'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className={labelClass}>Nombre completo *</label>
            <input value={name} onChange={e => { setName(e.target.value); setError('') }}
              placeholder="María González" className={inputClass} autoFocus />
          </div>
          <div>
            <label className={labelClass}>Teléfono</label>
            <input value={phone} onChange={e => setPhone(e.target.value)}
              type="tel" placeholder="55 1234 5678" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Dirección <span className="text-slate-600">(para domicilio)</span></label>
            <input value={address} onChange={e => setAddress(e.target.value)}
              placeholder="Calle, número, colonia" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Notas</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="ej: cliente frecuente, alérgico a X detergente"
              rows={2} className={`${inputClass} resize-none`} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 text-sm hover:bg-slate-800 transition-colors">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
              {customer ? 'Guardar' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Card de cliente ───────────────────────────────────────────

interface CustomerCardProps {
  customer: Customer
  orderCount: number
  onEdit: () => void
  onDelete: () => void
  onHistory: () => void
}

const CustomerCard = ({ customer, orderCount, onEdit, onDelete, onHistory }: CustomerCardProps) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
    {/* Fila superior: avatar + nombre + acciones */}
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/20
        flex items-center justify-center text-base font-bold text-indigo-300 shrink-0">
        {customer.name.charAt(0).toUpperCase()}
      </div>

      {/* Nombre y datos */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white leading-tight truncate">{customer.name}</p>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-y-0.5 gap-x-3 text-xs text-slate-500 mt-0.5">
          {customer.phone   && <span className="flex items-center gap-1">📞 {customer.phone}</span>}
          {customer.address && <span className="flex items-center gap-1 truncate">📍 {customer.address}</span>}
        </div>
        {customer.notes && (
          <p className="text-xs text-slate-600 italic mt-1 truncate">"{customer.notes}"</p>
        )}
      </div>

      {/* Botones editar/borrar — siempre visibles */}
      <div className="flex gap-1 shrink-0">
        <button onClick={onEdit}
          className="w-9 h-9 flex items-center justify-center rounded-lg
            text-slate-500 hover:text-indigo-400 hover:bg-slate-800 transition-colors">
          ✏️
        </button>
        <button onClick={onDelete}
          className="w-9 h-9 flex items-center justify-center rounded-lg
            text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors">
          🗑️
        </button>
      </div>
    </div>

    {/* Fila inferior: badge de pedidos (siempre visible, clic → historial) */}
    <div className="mt-3 flex items-center gap-2">
      <button onClick={onHistory}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
          bg-slate-800 hover:bg-indigo-600/20 hover:border-indigo-500/30
          border border-slate-700 hover:border-indigo-500/30
          text-xs text-slate-400 hover:text-indigo-300 transition-colors">
        🧺 {orderCount} pedido{orderCount !== 1 ? 's' : ''} · Ver historial →
      </button>
    </div>
  </div>
)

// ── Page ──────────────────────────────────────────────────────

export const CustomersPage = () => {
  const navigate = useNavigate()
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomers()
  const { orders } = useOrders()
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState<Customer | null>(null)
  const [search,   setSearch]   = useState('')

  // Escuchar atajo C desde OrdersPage
  useEffect(() => {
    const handler = () => { setShowForm(true); setEditing(null) }
    window.addEventListener('open-new-customer', handler)
    return () => window.removeEventListener('open-new-customer', handler)
  }, [])

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  const handleSave = (data: Omit<Customer, 'id' | 'createdAt'>) => {
    if (editing) updateCustomer({ ...editing, ...data })
    else addCustomer(data)
    setEditing(null)
  }

  const orderCount = (id: string) => orders.filter(o => o.customerId === id).length

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Encabezado */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-slate-500 text-sm">
            {customers.length} cliente{customers.length !== 1 ? 's' : ''} registrados
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditing(null) }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500
            text-white text-sm font-medium rounded-xl transition-colors whitespace-nowrap"
        >
          ➕ <span className="hidden sm:inline">Nuevo</span> cliente
          <kbd className="hidden sm:inline text-[10px] bg-indigo-700 px-1.5 py-0.5 rounded font-mono opacity-70">C</kbd>
        </button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o teléfono..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-9 py-2.5
            text-sm text-white placeholder:text-slate-600
            focus:outline-none focus:border-indigo-500 transition-colors"
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs">
            ✕
          </button>
        )}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl py-14 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-slate-500 text-sm">
            {search ? `Sin resultados para "${search}"` : 'Agrega tu primer cliente'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(customer => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              orderCount={orderCount(customer.id)}
              onEdit={() => { setEditing(customer); setShowForm(true) }}
              onDelete={() => confirm('¿Eliminar cliente?') && deleteCustomer(customer.id)}
              onHistory={() => navigate(`/customers/${customer.id}/history`)}
            />
          ))}
        </div>
      )}

      {(showForm || editing) && (
        <CustomerFormModal
          customer={editing ?? undefined}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}
