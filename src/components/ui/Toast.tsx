/**
 * UI / Toast.tsx
 *
 * Notificación flotante que aparece abajo-derecha en escritorio
 * y abajo-centro en móvil, sin chocar con el Header ni el Sidebar.
 *
 * - z-50 para estar por encima de todo
 * - bottom-safe para no tapar nada del layout superior
 * - Animación de entrada/salida con CSS
 */
import { useEffect, useState } from 'react'

interface Props {
  message: string
  type?: 'success' | 'error'
  onClose: () => void
}

export const Toast = ({ message, type = 'success', onClose }: Props) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Pequeño delay para activar la transición de entrada
    const show = requestAnimationFrame(() => setVisible(true))

    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)   // esperar a que termine la salida
    }, 4000)

    return () => {
      cancelAnimationFrame(show)
      clearTimeout(timer)
    }
  }, [])

  const base = type === 'success'
    ? 'bg-emerald-600 border-emerald-500'
    : 'bg-red-700 border-red-600'

  return (
    <div
      className={`
        fixed z-50
        bottom-5 left-1/2 -translate-x-1/2
        sm:left-auto sm:translate-x-0 sm:right-6 sm:bottom-6
        w-[calc(100vw-2rem)] sm:w-auto sm:max-w-sm
        flex items-start gap-3
        px-4 py-3.5 rounded-xl border shadow-2xl
        text-white text-sm font-medium
        transition-all duration-300 ease-out
        ${base}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      <span className="text-base shrink-0 mt-px">
        {type === 'success' ? '✅' : '⏰'}
      </span>
      <p className="flex-1 leading-snug">{message}</p>
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300) }}
        className="shrink-0 text-white/60 hover:text-white transition-colors mt-px"
      >
        ✕
      </button>
    </div>
  )
}
