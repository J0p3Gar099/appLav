/**
 * CONTEXT / CostContext.tsx
 * Costos operativos — solo admin puede ver y registrar.
 */
import {
  createContext, useCallback, useContext,
  useEffect, useReducer, type ReactNode,
} from 'react'
import type { OperationalCost } from '@/models/cost.model'
import { storageGet, storageSet } from '@/utils/storage.utils'
import { useAuth } from '@/context/AuthContext'

const STORAGE_KEY = 'laundry_costs'

interface CostState { costs: OperationalCost[]; isLoading: boolean }
type CostAction =
  | { type: 'LOAD';   payload: OperationalCost[] }
  | { type: 'ADD';    payload: OperationalCost }
  | { type: 'DELETE'; payload: string }

function costReducer(state: CostState, action: CostAction): CostState {
  switch (action.type) {
    case 'LOAD':   return { costs: action.payload, isLoading: false }
    case 'ADD':    return { ...state, costs: [action.payload, ...state.costs] }
    case 'DELETE': return { ...state, costs: state.costs.filter(c => c.id !== action.payload) }
    default: return state
  }
}

interface CostContextValue {
  costs: OperationalCost[]
  isLoading: boolean
  addCost: (data: Omit<OperationalCost, 'id' | 'createdAt' | 'createdBy'>) => void
  deleteCost: (id: string) => void
}

const CostContext = createContext<CostContextValue | null>(null)

export function CostProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(costReducer, { costs: [], isLoading: true })

  useEffect(() => {
    const stored = storageGet<OperationalCost[]>(STORAGE_KEY) ?? []
    dispatch({ type: 'LOAD', payload: stored })
  }, [])

  useEffect(() => {
    if (!state.isLoading) storageSet(STORAGE_KEY, state.costs)
  }, [state.costs, state.isLoading])

  const addCost = useCallback((data: Omit<OperationalCost, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!user) return
    const cost: OperationalCost = { ...data, id: crypto.randomUUID(), createdBy: user.id, createdAt: new Date().toISOString() }
    dispatch({ type: 'ADD', payload: cost })
  }, [user])

  const deleteCost = useCallback((id: string) => {
    dispatch({ type: 'DELETE', payload: id })
  }, [])

  return (
    <CostContext.Provider value={{ ...state, addCost, deleteCost }}>
      {children}
    </CostContext.Provider>
  )
}

export function useCosts(): CostContextValue {
  const ctx = useContext(CostContext)
  if (!ctx) throw new Error('useCosts() debe usarse dentro de <CostProvider>')
  return ctx
}
