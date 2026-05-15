/**
 * CONTEXT / UserContext.tsx
 *
 * Maneja los usuarios/empleados de la app.
 * Es la fuente de verdad para el login: authService leerá
 * de aquí en lugar del array hardcodeado en auth.config.ts.
 *
 * Al montar por primera vez, carga los usuarios semilla del config
 * para que admin y user puedan loguearse desde el inicio.
 */
import {
  createContext, useCallback, useContext,
  useEffect, useReducer, type ReactNode,
} from 'react'
import type { Employee } from '@/models/employee.model'
import { storageGet, storageSet } from '@/utils/storage.utils'
import { AUTH_CONFIG } from '@/config/auth.config'

const STORAGE_KEY = 'laundry_employees'

// ── Seed inicial ─────────────────────────────────────────────
// Si localStorage está vacío, creamos los usuarios del config
// para que la app funcione desde el primer arranque.
const SEED_EMPLOYEES: Employee[] = AUTH_CONFIG.MOCK_USERS.map(u => ({
  id:        u.id,
  username:  u.username,
  password:  u.password,
  role:      u.role,
  firstName: u.displayName,
  lastName:  '',
  shift:     'MAÑANA',
  schedule:  'Lun-Vie 09:00-17:00',
  startDate: new Date().toISOString(),
  salary:    0,
  isActive:  true,
  createdAt: new Date().toISOString(),
}))

// ── Estado y Acciones ─────────────────────────────────────────

interface UserState {
  employees: Employee[]
  isLoading: boolean
}

type UserAction =
  | { type: 'LOAD';             payload: Employee[] }
  | { type: 'ADD';              payload: Employee }
  | { type: 'UPDATE';           payload: Employee }
  | { type: 'DELETE';           payload: string }
  | { type: 'CHANGE_PASSWORD';  payload: { id: string; password: string } }

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'LOAD':
      return { employees: action.payload, isLoading: false }
    case 'ADD':
      return { ...state, employees: [...state.employees, action.payload] }
    case 'UPDATE':
      return {
        ...state,
        employees: state.employees.map(e =>
          e.id === action.payload.id ? action.payload : e
        ),
      }
    case 'DELETE':
      // Nunca borramos, solo desactivamos
      return {
        ...state,
        employees: state.employees.map(e =>
          e.id === action.payload ? { ...e, isActive: false } : e
        ),
      }
    case 'CHANGE_PASSWORD':
      return {
        ...state,
        employees: state.employees.map(e =>
          e.id === action.payload.id
            ? { ...e, password: action.payload.password }
            : e
        ),
      }
    default:
      return state
  }
}

// ── Context Value ─────────────────────────────────────────────

interface UserContextValue {
  employees: Employee[]
  isLoading: boolean
  addEmployee:      (data: Omit<Employee, 'id' | 'createdAt'>) => void
  updateEmployee:   (employee: Employee) => void
  deactivateEmployee: (id: string) => void
  changePassword:   (id: string, newPassword: string) => void
  /** Usado por authService para validar login */
  findByCredentials: (username: string, password: string) => Employee | undefined
}

const UserContext = createContext<UserContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────

export function UserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, {
    employees: [],
    isLoading: true,
  })

  // Cargar desde localStorage, o sembrar con usuarios iniciales
  useEffect(() => {
    const stored = storageGet<Employee[]>(STORAGE_KEY)
    if (stored && stored.length > 0) {
      dispatch({ type: 'LOAD', payload: stored })
    } else {
      // Primera vez: cargar seed
      dispatch({ type: 'LOAD', payload: SEED_EMPLOYEES })
    }
  }, [])

  // Sincronizar con localStorage
  useEffect(() => {
    if (!state.isLoading) {
      storageSet(STORAGE_KEY, state.employees)
    }
  }, [state.employees, state.isLoading])

  const addEmployee = useCallback(
    (data: Omit<Employee, 'id' | 'createdAt'>) => {
      const employee: Employee = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      }
      dispatch({ type: 'ADD', payload: employee })
    },
    []
  )

  const updateEmployee = useCallback((employee: Employee) => {
    dispatch({ type: 'UPDATE', payload: employee })
  }, [])

  const deactivateEmployee = useCallback((id: string) => {
    dispatch({ type: 'DELETE', payload: id })
  }, [])

  const changePassword = useCallback((id: string, newPassword: string) => {
    dispatch({ type: 'CHANGE_PASSWORD', payload: { id, password: newPassword } })
  }, [])

  const findByCredentials = useCallback(
    (username: string, password: string) =>
      state.employees.find(
        e => e.username === username &&
             e.password === password &&
             e.isActive
      ),
    [state.employees]
  )

  return (
    <UserContext.Provider value={{
      employees: state.employees,
      isLoading: state.isLoading,
      addEmployee,
      updateEmployee,
      deactivateEmployee,
      changePassword,
      findByCredentials,
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUsers(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUsers() debe usarse dentro de <UserProvider>')
  return ctx
}