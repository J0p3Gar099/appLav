/**
 * PAGES / NotFoundPage.tsx — 404 Not Found
 */
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { AUTH_CONFIG } from '@/config/auth.config'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-8xl font-black text-slate-800 mb-4">404</p>
        <h1 className="text-2xl font-bold text-white mb-2">Página no encontrada</h1>
        <p className="text-slate-500 mb-8">La ruta que buscas no existe.</p>
        <Button
          onClick={() =>
            navigate(isAuthenticated
              ? AUTH_CONFIG.ROUTES.DASHBOARD
              : AUTH_CONFIG.ROUTES.LOGIN
            )
          }
        >
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}
