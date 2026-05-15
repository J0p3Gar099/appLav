/**
 * ROUTES / PublicRoute.tsx
 *
 * El "anti-PrivateRoute": protege rutas que solo deben ser accesibles
 * para usuarios NO autenticados (login, registro, recuperar contraseña).
 *
 * ¿Por qué lo necesitamos?
 * Si un usuario ya está logueado e intenta ir a /login:
 *   Sin PublicRoute → ve el formulario de login (absurdo)
 *   Con PublicRoute → redirige automáticamente al dashboard
 *
 * Esto da la experiencia que el usuario espera: si ya tengo sesión,
 * la app me lleva directo a donde puedo trabajar.
 */

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { AUTH_CONFIG } from '@/config/auth.config'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

export function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  // Igual que en PrivateRoute: esperamos a que la sesión se verifique
  if (isLoading) return <LoadingScreen />

  // Si ya está autenticado, redirige al dashboard
  if (isAuthenticated) {
    return <Navigate to={AUTH_CONFIG.ROUTES.DASHBOARD} replace />
  }

  // No autenticado: puede ver la ruta pública normalmente
  return <Outlet />
}
