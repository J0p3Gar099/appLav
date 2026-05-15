/**
 * CONTEXT / CustomerContext.tsx
 * Estado global del catálogo de clientes con persistencia en localStorage.
 */
import {
  createContext, useCallback, useContext,
  useEffect, useReducer, type ReactNode,
} from 'react'
import type { Customer } from '@/models/customer.model'
import { storageGet, storageSet } from '@/utils/storage.utils'

const STORAGE_KEY = 'laundry_customers'

interface CustomerState { customers: Customer[]; isLoading: boolean }
type CustomerAction =
  | { type: 'LOAD';   payload: Customer[] }
  | { type: 'ADD';    payload: Customer }
  | { type: 'UPDATE'; payload: Customer }
  | { type: 'DELETE'; payload: string }

function customerReducer(state: CustomerState, action: CustomerAction): CustomerState {
  switch (action.type) {
    case 'LOAD':   return { customers: action.payload, isLoading: false }
    case 'ADD':    return { ...state, customers: [action.payload, ...state.customers] }
    case 'UPDATE': return { ...state, customers: state.customers.map(c => c.id === action.payload.id ? action.payload : c) }
    case 'DELETE': return { ...state, customers: state.customers.filter(c => c.id !== action.payload) }
    default: return state
  }
}

interface CustomerContextValue {
  customers: Customer[]
  isLoading: boolean
  addCustomer: (data: Omit<Customer, 'id' | 'createdAt'>) => Customer
  updateCustomer: (customer: Customer) => void
  deleteCustomer: (id: string) => void
  getCustomerById: (id: string) => Customer | undefined
}

const CustomerContext = createContext<CustomerContextValue | null>(null)

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(customerReducer, { customers: [], isLoading: true })

  useEffect(() => {
    const stored = storageGet<Customer[]>(STORAGE_KEY) ?? []
    dispatch({ type: 'LOAD', payload: stored })
  }, [])

  useEffect(() => {
    if (!state.isLoading) storageSet(STORAGE_KEY, state.customers)
  }, [state.customers, state.isLoading])

  const addCustomer = useCallback((data: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const customer: Customer = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    dispatch({ type: 'ADD', payload: customer })
    return customer
  }, [])

  const updateCustomer = useCallback((customer: Customer) => {
    dispatch({ type: 'UPDATE', payload: customer })
  }, [])

  const deleteCustomer = useCallback((id: string) => {
    dispatch({ type: 'DELETE', payload: id })
  }, [])

  const getCustomerById = useCallback((id: string) =>
    state.customers.find(c => c.id === id), [state.customers])

  return (
    <CustomerContext.Provider value={{ ...state, addCustomer, updateCustomer, deleteCustomer, getCustomerById }}>
      {children}
    </CustomerContext.Provider>
  )
}

export function useCustomers(): CustomerContextValue {
  const ctx = useContext(CustomerContext)
  if (!ctx) throw new Error('useCustomers() debe usarse dentro de <CustomerProvider>')
  return ctx
}
