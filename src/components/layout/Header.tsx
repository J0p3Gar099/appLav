/**
 * LAYOUT / Header.tsx — barra superior responsiva.
 * En móvil muestra el botón hamburguesa para abrir el sidebar.
 * En desktop el sidebar siempre está visible, así que el Header
 * solo muestra el título de la sección actual.
 */
interface HeaderProps {
  onMenuToggle: () => void
  title?: string
}

export const Header = ({ onMenuToggle, title = 'LavApp' }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800 px-4 py-3 flex items-center gap-3">
      {/* Botón hamburguesa — solo visible en móvil */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        aria-label="Abrir menú"
      >
        <span className="text-xl">☰</span>
      </button>
      <h1 className="text-slate-200 font-semibold text-base lg:hidden">{title}</h1>
    </header>
  )
}
