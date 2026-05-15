/**
 * COMPONENTS/AUTH / UserMenu.tsx
 *
 * Menú del usuario autenticado en el dashboard.
 * Muestra nombre, rol, y el botón de logout.
 *
 * Usa usePermissions() para mostrar/ocultar opciones según el rol,
 * sin necesidad de consultar al contexto directamente.
 */
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'
import { Button } from '@/components/ui/Button'

export function UserMenu() {
  const { user, logout, isLoading } = useAuth()
  const { isAdmin } = usePermissions()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  const ROLE_BADGE_CLASS = isAdmin
    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(p => !p)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
      >
        {/* Avatar con inicial */}
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
          {user.displayName.charAt(0).toUpperCase()}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium text-slate-200">{user.displayName}</p>
          <p className="text-xs text-slate-500">@{user.username}</p>
        </div>
        <span className="text-slate-500 text-xs">▼</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay para cerrar al hacer click fuera */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-20 p-2">
            <div className="px-3 py-2 mb-1">
              <p className="text-sm font-medium text-slate-200">{user.displayName}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
              <span className={`inline-block mt-1.5 px-2 py-0.5 text-xs rounded-full border font-medium ${ROLE_BADGE_CLASS}`}>
                {isAdmin ? '👑 Administrador' : '👤 Usuario'}
              </span>
            </div>
            <div className="border-t border-slate-800 pt-1">
              <Button
                variant="ghost"
                isLoading={isLoading}
                onClick={() => { setIsOpen(false); logout() }}
                className="w-full justify-start text-red-400 hover:bg-red-500/10"
              >
                Cerrar sesión
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
