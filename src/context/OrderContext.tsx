/**
 * CONTEXT / OrderContext.tsx
 *
 * Estado global de pedidos. Maneja CRUD completo con persistencia
 * en localStorage y permisos por rol embebidos en cada operación.
 *
 * Regla clave: pedidos con status ENTREGADO son inmutables.
 * No se pueden editar ni cambiar de estado.
 *
 * [NOTIFICACIONES] Al cambiar status a LISTO se asigna readyAt
 * con la fecha/hora actual para que useReadyReminders calcule
 * el tiempo real que lleva el pedido esperando ser recogido.
 */

import {
  createContext, useCallback, useContext,
  useEffect, useMemo, useReducer, type ReactNode,
} from 'react'
import type { Order } from '@/models/order.model'
import { storageGet, storageSet } from '@/utils/storage.utils'
import { useAuth } from '@/context/AuthContext'

// ── Estado y Acciones ─────────────────────────────────────────

interface OrderState {
  orders: Order[]
  isLoading: boolean
}

type OrderAction =
  | { type: 'LOAD';   payload: Order[] }
  | { type: 'ADD';    payload: Order }
  | { type: 'UPDATE'; payload: Order }
  | { type: 'DELETE'; payload: string }

const STORAGE_KEY = 'laundry_orders'

function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case 'LOAD':
      return { ...state, orders: action.payload, isLoading: false }
    case 'ADD':
      return { ...state, orders: [action.payload, ...state.orders] }
    case 'UPDATE':
      return {
        ...state,
        orders: state.orders.map(o =>
          o.id === action.payload.id ? action.payload : o
        ),
      }
    case 'DELETE':
      return {
        ...state,
        orders: state.orders.filter(o => o.id !== action.payload),
      }
    default:
      return state
  }
}

// ── Context Value ─────────────────────────────────────────────

interface OrderContextValue {
  orders: Order[]
  isLoading: boolean
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'createdBy'>) => void
  updateOrder: (order: Order) => boolean   // false si no tiene permiso
  deleteOrder: (id: string) => boolean
  getOrderById: (id: string) => Order | undefined
}

const OrderContext = createContext<OrderContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────

export function OrderProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(orderReducer, {
    orders: [],
    isLoading: true,
  })

  useEffect(() => {
    const stored = storageGet<Order[]>(STORAGE_KEY) ?? []
    dispatch({ type: 'LOAD', payload: stored })
  }, [])

  useEffect(() => {
    if (!state.isLoading) {
      storageSet(STORAGE_KEY, state.orders)
    }
  }, [state.orders, state.isLoading])

  const addOrder = useCallback(
    (data: Omit<Order, 'id' | 'createdAt' | 'createdBy'>) => {
      if (!user) return
      const order: Order = {
        ...data,
        id: crypto.randomUUID(),
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        // [NOTIFICACIONES] Si se crea directamente en LISTO, registrar readyAt
        readyAt: data.status === 'LISTO' ? new Date().toISOString() : undefined,
      }
      dispatch({ type: 'ADD', payload: order })
    },
    [user]
  )

  const updateOrder = useCallback(
    (order: Order): boolean => {
      if (!user) return false
      // Pedidos ENTREGADOS son completamente inmutables
      const existing = state.orders.find(o => o.id === order.id)
      if (existing?.status === 'ENTREGADO') return false
      // Admin puede editar todo; user solo sus propios pedidos
      const canEdit = user.role === 'admin' || order.createdBy === user.id
      if (!canEdit) return false

      // [NOTIFICACIONES] Registrar cuándo pasó a LISTO por primera vez
      const readyAt =
        order.status === 'LISTO' && !existing?.readyAt
          ? new Date().toISOString()
          : order.readyAt

      dispatch({ type: 'UPDATE', payload: { ...order, readyAt } })
      return true
    },
    [user, state.orders]
  )

  const deleteOrder = useCallback(
    (id: string): boolean => {
      if (!user) return false
      const order = state.orders.find(o => o.id === id)
      if (!order) return false
      // No se pueden borrar pedidos ENTREGADOS (solo admin puede)
      if (order.status === 'ENTREGADO' && user.role !== 'admin') return false
      const canDelete = user.role === 'admin' || order.createdBy === user.id
      if (!canDelete) return false
      dispatch({ type: 'DELETE', payload: id })
      return true
    },
    [user, state.orders]
  )

  const getOrderById = useCallback(
    (id: string) => state.orders.find(o => o.id === id),
    [state.orders]
  )

  const value = useMemo(() => ({
    orders: state.orders,
    isLoading: state.isLoading,
    addOrder, updateOrder, deleteOrder, getOrderById,
  }), [state.orders, state.isLoading, addOrder, updateOrder, deleteOrder, getOrderById])

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders(): OrderContextValue {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrders() debe usarse dentro de <OrderProvider>')
  return ctx
}
