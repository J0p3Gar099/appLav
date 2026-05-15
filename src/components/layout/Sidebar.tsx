/**
 * LAYOUT / Sidebar.tsx
 *
 * Sidebar responsivo con nueva entrada Calendario.
 */
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'

interface SidebarProps { isOpen: boolean; onClose: () => void }

interface NavItem {
  to: string; label: string; icon: string; adminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard',  label: 'Dashboard',   icon: '📊' },
  { to: '/orders',     label: 'Pedidos',     icon: '🧺' },
  { to: '/calendar',   label: 'Calendario',  icon: '📅' },
  { to: '/customers',  label: 'Clientes',    icon: '👥' },
  { to: '/costs',      label: 'Costos',      icon: '💸', adminOnly: true },
  { to: '/employees',  label: 'Empleados',   icon: '👤', adminOnly: true },
  { to: '/attendance', label: 'Asistencia',  icon: '🕐', adminOnly: true },
]

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, logout, isLoading } = useAuth()
  const { isAdmin } = usePermissions()
  const visibleItems = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin)

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />
      )}
      <aside className={`
        fixed top-0 left-0 h-full w-64 z-30 flex flex-col
        bg-slate-900 border-r border-slate-800
        transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🫧</span>
            <span className="font-bold text-white text-lg tracking-tight">LavApp</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-1">✕</button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleItems.map(item => (
            <NavLink key={item.to} to={item.to} onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150
                ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
              {item.adminOnly && (
                <span className="ml-auto text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">Admin</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {user?.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.displayName}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={() => logout()} disabled={isLoading}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm
              text-red-400 hover:bg-red-500/10 transition-colors duration-150
              disabled:opacity-50 disabled:cursor-not-allowed">
            <span>🚪</span> Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
