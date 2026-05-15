import {
  createContext, useCallback, useContext,
  useEffect, useReducer, type ReactNode,
} from 'react'
import { authService } from '@/services/auth.service'
import { useUsers } from '@/context/UserContext'
import type { LoginCredentials, User } from '@/models/user.model'

interface AuthState {
  user:            User | null
  token:           string | null
  isAuthenticated: boolean
  isLoading:       boolean
  error:           string | null
}

type AuthAction =
  | { type: 'AUTH_INIT_START' }
  | { type: 'AUTH_INIT_DONE';  payload: { user: User; token: string } | null }
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS';   payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE';   payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }

const initialState: AuthState = {
  user: null, token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_INIT_START':
      return { ...state, isLoading: true }
    case 'AUTH_INIT_DONE':
      if (action.payload) {
        return { ...state, user: action.payload.user, token: action.payload.token, isAuthenticated: true, isLoading: false }
      }
      return { ...state, isLoading: false }
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null }
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload.user, token: action.payload.token, isAuthenticated: true, isLoading: false, error: null }
    case 'LOGIN_FAILURE':
      return { ...state, isLoading: false, error: action.payload }
    case 'LOGOUT':
      return { ...initialState, isLoading: false }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

interface AuthContextValue extends AuthState {
  login:      (credentials: LoginCredentials) => Promise<void>
  logout:     () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  // ── 1. Hooks primero, en orden ────────────────────────────
  const [state, dispatch] = useReducer(authReducer, initialState)
  const { findByCredentials } = useUsers()   // ← aquí, después del useReducer

  // ── 2. Efectos ────────────────────────────────────────────
  useEffect(() => {
    dispatch({ type: 'AUTH_INIT_START' })
    const stored = authService.getStoredSession()
    dispatch({ type: 'AUTH_INIT_DONE', payload: stored })
  }, [])

  // ── 3. Callbacks ──────────────────────────────────────────
  const login = useCallback(async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_START' })
    const result = await authService.login(credentials, findByCredentials)
    if (!result.success) {
      dispatch({ type: 'LOGIN_FAILURE', payload: result.error })
      return
    }
    authService.persistSession(result.data.user, result.data.token)
    dispatch({ type: 'LOGIN_SUCCESS', payload: result.data })
  }, [findByCredentials])

  const logout = useCallback(async () => {
    await authService.logout()
    dispatch({ type: 'LOGOUT' })
  }, [])

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth() debe usarse dentro de <AuthProvider>.')
  }
  return context
}