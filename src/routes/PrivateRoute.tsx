/**
 * ROUTES / PrivateRoute.tsx
 *
 * Componente de orden superior (Higher-Order Component) para proteger rutas.
 *
 * CONCEPTO CLAVE: ¿Cómo funciona la protección de rutas?
 *
 * React Router v6 renderiza rutas como componentes. Entonces podemos
 * crear un componente "guardián" que, antes de mostrar el contenido real,
 * verifica si el usuario tiene permiso. Si no lo tiene, redirige.
 *
 * Flujo de decisión:
 *   ┌─────────────────────────────────┐
 *   │  ¿Está cargando la sesión?      │──── SÍ → mostrar Spinner
 *   └─────────────────────────────────┘
 *              │ NO
 *              ▼
 *   ┌─────────────────────────────────┐
 *   │  ¿Está autenticado?             │──── NO → redirigir a /login
 *   └─────────────────────────────────┘
 *              │ SÍ
 *              ▼
 *   ┌─────────────────────────────────┐
 *   │  ¿Requiere rol específico?      │
 *   │  ¿El usuario tiene ese rol?     │──── NO → redirigir a /403
 *   └─────────────────────────────────┘
 *              │ SÍ
 *              ▼
 *         Renderizar ruta ✓
 *
 * IMPORTANTE: el prop "replace" en <Navigate> reemplaza la entrada
 * actual del historial en lugar de añadir una nueva. Así el botón
 * "atrás" del navegador no queda en un loop de redirecciones.
 */

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { AUTH_CONFIG } from '@/config/auth.config'
import type { UserRole } from '@/models/user.model'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

interface PrivateRouteProps {
  /**
   * requiredRole — si se especifica, solo usuarios con ESE rol pueden acceder.
   * Si no se especifica, cualquier usuario autenticado puede pasar.
   */
  requiredRole?: UserRole
}

export function PrivateRoute({ requiredRole }: PrivateRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()

  /**
   * Caso 1: Sesión cargando
   *
   * Al recargar la página, el AuthContext verifica localStorage.
   * Durante ese proceso isLoading=true. Si renderizamos <Navigate to="/login">
   * antes de que termine, el usuario autenticado sería expulsado al login.
   * Esperamos con un spinner hasta saber el estado real.
   */
  if (isLoading) {
    return <LoadingScreen />
  }

  /**
   * Caso 2: No autenticado
   *
   * Guardamos la ruta intentada en "state" para poder redirigir de vuelta
   * después del login. El componente LoginPage puede leer location.state.from
   * y redirigir al destino original.
   *
   * Ejemplo: el usuario intenta ir a /dashboard/reports sin estar logueado.
   * → Va a /login
   * → Se loguea
   * → Va a /dashboard/reports (no al /dashboard genérico)
   */
  if (!isAuthenticated) {
    return (
      <Navigate
        to={AUTH_CONFIG.ROUTES.LOGIN}
        state={{ from: window.location.pathname }}
        replace
      />
    )
  }

  /**
   * Caso 3: Autenticado pero sin el rol requerido
   *
   * Si la ruta requiere rol 'admin' y el usuario es 'user':
   * → Redirige a la página 403 (Forbidden)
   */
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={AUTH_CONFIG.ROUTES.FORBIDDEN} replace />
  }

  /**
   * Caso 4: Todo OK — renderizar la ruta hija.
   *
   * <Outlet /> es el placeholder de React Router v6 que renderiza
   * el componente de la ruta actual. Es el equivalente a {children}
   * pero para rutas anidadas.
   */
  return <Outlet />
}
