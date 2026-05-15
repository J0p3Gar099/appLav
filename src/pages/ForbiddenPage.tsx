/**
 * PAGES / ForbiddenPage.tsx — 403 Forbidden
 * Se muestra cuando el usuario está autenticado pero no tiene
 * el rol requerido para la ruta que intentó acceder.
 */
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { AUTH_CONFIG } from '@/config/auth.config'
import { Button } from '@/components/ui/Button'

export function ForbiddenPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-8xl mb-6">🚫</p>
        <h1 className="text-3xl font-bold text-white mb-2">Acceso denegado</h1>
        <p className="text-slate-500 mb-2">
          No tienes permisos para ver esta página.
        </p>
        {user && (
          <p className="text-slate-600 text-sm mb-8">
            Tu rol actual es <span className="text-indigo-400 font-medium">{user.role}</span>.
          </p>
        )}
        <Button onClick={() => navigate(AUTH_CONFIG.ROUTES.DASHBOARD)}>
          Volver al dashboard
        </Button>
      </div>
    </div>
  )
}
