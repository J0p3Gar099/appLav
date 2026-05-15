/**
 * CONTEXT / AttendanceContext.tsx
 *
 * Registra login y logout de cada usuario para control de asistencia.
 * Solo el admin puede ver la página de asistencia.
 */

import {
  createContext, useCallback, useContext,
  useEffect, useMemo, useReducer, type ReactNode,
} from 'react'
import type { AttendanceEntry } from '@/models/attendance.model'
import { storageGet, storageSet } from '@/utils/storage.utils'

const STORAGE_KEY = 'laundry_attendance'

interface AttendanceState {
  entries: AttendanceEntry[]
}

type AttendanceAction =
  | { type: 'LOAD';   payload: AttendanceEntry[] }
  | { type: 'ADD';    payload: AttendanceEntry }
  | { type: 'LOGOUT'; payload: { userId: string; logoutAt: string } }

function attendanceReducer(state: AttendanceState, action: AttendanceAction): AttendanceState {
  switch (action.type) {
    case 'LOAD': return { entries: action.payload }
    case 'ADD':  return { entries: [action.payload, ...state.entries] }
    case 'LOGOUT':
      return {
        entries: state.entries.map(e => {
          // Cerrar la sesión más reciente del usuario que aún está abierta
          if (e.userId === action.payload.userId && !e.logoutAt) {
            return { ...e, logoutAt: action.payload.logoutAt }
          }
          return e
        }),
      }
    default: return state
  }
}

interface AttendanceContextValue {
  entries: AttendanceEntry[]
  recordLogin: (user: { id: string; displayName: string; role: string }) => void
  recordLogout: (userId: string) => void
}

const AttendanceContext = createContext<AttendanceContextValue | null>(null)

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(attendanceReducer, { entries: [] })

  useEffect(() => {
    const stored = storageGet<AttendanceEntry[]>(STORAGE_KEY) ?? []
    dispatch({ type: 'LOAD', payload: stored })
  }, [])

  useEffect(() => {
    storageSet(STORAGE_KEY, state.entries)
  }, [state.entries])

  const recordLogin = useCallback((user: { id: string; displayName: string; role: string }) => {
    const entry: AttendanceEntry = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.displayName,
      userRole: user.role,
      loginAt: new Date().toISOString(),
    }
    dispatch({ type: 'ADD', payload: entry })
  }, [])

  const recordLogout = useCallback((userId: string) => {
    dispatch({ type: 'LOGOUT', payload: { userId, logoutAt: new Date().toISOString() } })
  }, [])

  const value = useMemo(() => ({
    entries: state.entries,
    recordLogin,
    recordLogout,
  }), [state.entries, recordLogin, recordLogout])

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  )
}

export function useAttendance(): AttendanceContextValue {
  const ctx = useContext(AttendanceContext)
  if (!ctx) throw new Error('useAttendance() debe usarse dentro de <AttendanceProvider>')
  return ctx
}
