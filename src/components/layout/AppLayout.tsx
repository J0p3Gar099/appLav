/**
 * LAYOUT / AppLayout.tsx
 *
 * Layout principal de la app autenticada.
 * Coordina el estado del sidebar (abierto/cerrado en móvil)
 * y define la estructura: Sidebar | Main(Header + Outlet).
 */
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export const AppLayout = () => {
  // Estado del sidebar en móvil (en desktop siempre está visible via CSS)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Área principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
