/**
 * LoadingScreen — pantalla de carga durante la verificación de sesión.
 * Se muestra brevemente al recargar mientras AuthContext lee localStorage.
 */
export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm tracking-widest uppercase">Verificando sesión</p>
      </div>
    </div>
  )
}
