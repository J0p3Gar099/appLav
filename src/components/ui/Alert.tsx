/**
 * Alert — componente de mensajes de error/éxito/info.
 *
 * Diseñado para ser reutilizable en cualquier parte de la app.
 * Acepta "variant" para diferentes colores semánticos.
 */

interface AlertProps {
  message: string
  variant?: 'error' | 'success' | 'info'
  onDismiss?: () => void
}

const VARIANT_STYLES = {
  error:   'bg-red-500/10 border-red-500/30 text-red-400',
  success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  info:    'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
} as const

const VARIANT_ICONS = {
  error:   '⚠',
  success: '✓',
  info:    'ℹ',
} as const

export function Alert({ message, variant = 'error', onDismiss }: AlertProps) {
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-sm ${VARIANT_STYLES[variant]}`}>
      <span className="shrink-0 mt-0.5">{VARIANT_ICONS[variant]}</span>
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Cerrar"
        >
          ✕
        </button>
      )}
    </div>
  )
}
