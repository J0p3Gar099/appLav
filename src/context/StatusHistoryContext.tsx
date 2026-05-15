/**
 * CONTEXT / StatusHistoryContext.tsx
 *
 * Persiste el historial de cambios de estado de cada pedido.
 * Solo accesible para admin.
 */

import {
  createContext, useCallback, useContext,
  useEffect, useMemo, useReducer, type ReactNode,
} from 'react'
import type { StatusHistoryEntry } from '@/models/statusHistory.model'
import type { OrderStatus } from '@/models/order.model'
import { storageGet, storageSet } from '@/utils/storage.utils'

const STORAGE_KEY = 'laundry_status_history'

interface HistoryState {
  entries: StatusHistoryEntry[]
}

type HistoryAction =
  | { type: 'LOAD'; payload: StatusHistoryEntry[] }
  | { type: 'ADD';  payload: StatusHistoryEntry }

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'LOAD': return { entries: action.payload }
    case 'ADD':  return { entries: [action.payload, ...state.entries] }
    default: return state
  }
}

interface StatusHistoryContextValue {
  entries: StatusHistoryEntry[]
  addEntry: (params: {
    orderId: string
    customerName: string
    fromStatus: OrderStatus | null
    toStatus: OrderStatus
    changedBy: string
    changedByName: string
  }) => void
  getEntriesForOrder: (orderId: string) => StatusHistoryEntry[]
}

const StatusHistoryContext = createContext<StatusHistoryContextValue | null>(null)

export function StatusHistoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(historyReducer, { entries: [] })

  useEffect(() => {
    const stored = storageGet<StatusHistoryEntry[]>(STORAGE_KEY) ?? []
    dispatch({ type: 'LOAD', payload: stored })
  }, [])

  useEffect(() => {
    storageSet(STORAGE_KEY, state.entries)
  }, [state.entries])

  const addEntry = useCallback((params: {
    orderId: string
    customerName: string
    fromStatus: OrderStatus | null
    toStatus: OrderStatus
    changedBy: string
    changedByName: string
  }) => {
    const entry: StatusHistoryEntry = {
      id: crypto.randomUUID(),
      ...params,
      changedAt: new Date().toISOString(),
    }
    dispatch({ type: 'ADD', payload: entry })
  }, [])

  const getEntriesForOrder = useCallback(
    (orderId: string) => state.entries.filter(e => e.orderId === orderId),
    [state.entries]
  )

  const value = useMemo(() => ({
    entries: state.entries,
    addEntry,
    getEntriesForOrder,
  }), [state.entries, addEntry, getEntriesForOrder])

  return (
    <StatusHistoryContext.Provider value={value}>
      {children}
    </StatusHistoryContext.Provider>
  )
}

export function useStatusHistory(): StatusHistoryContextValue {
  const ctx = useContext(StatusHistoryContext)
  if (!ctx) throw new Error('useStatusHistory() debe usarse dentro de <StatusHistoryProvider>')
  return ctx
}
