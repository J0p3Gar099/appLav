/**
 * Button — botón reutilizable con variantes y estado de carga.
 *
 * El prop "isLoading" desactiva el botón y muestra un spinner.
 * Esto evita doble-submit accidental durante llamadas async.
 *
 * Extendemos React.ButtonHTMLAttributes para heredar todos los props
 * nativos (onClick, type, disabled, etc.) sin redeclararlos.
 */
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  isLoading?: boolean
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:   'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700',
  danger:    'bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-500/30',
  ghost:     'bg-transparent hover:bg-slate-800 text-slate-400 border-transparent',
}

export function Button({
  variant = 'primary',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2
        px-4 py-2.5 rounded-lg border text-sm font-medium
        transition-all duration-150 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANT_CLASSES[variant]}
        ${className}
      `}
      {...rest}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
