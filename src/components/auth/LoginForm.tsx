/**
 * COMPONENTS/AUTH / LoginForm.tsx
 *
 * Formulario de login. Componente presentacional con lógica de UI propia.
 *
 * RESPONSABILIDADES de este componente:
 *   ✓ Gestionar el estado del formulario (campos, errores de validación)
 *   ✓ Validar antes de enviar (cliente, no servidor)
 *   ✓ Llamar a auth.login() con las credenciales
 *   ✓ Redirigir al destino correcto tras el login
 *
 * LO QUE NO HACE (lo hace el contexto):
 *   ✗ Guardar en localStorage
 *   ✗ Gestionar el token
 *   ✗ Saber si ya está autenticado
 *
 * PATRON: Controlled Form
 * Cada input tiene value={state} + onChange={setter}.
 * React es la única fuente de verdad del valor del campo.
 */

import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { AUTH_CONFIG } from '@/config/auth.config'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'

interface FormFields {
  username: string
  password: string
}

interface FormErrors {
  username?: string
  password?: string
}

export function LoginForm() {
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Estado del formulario — local, solo vive en este componente
  const [fields, setFields] = useState<FormFields>({ username: '', password: '' })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)

  /**
   * Ruta de redirección post-login.
   *
   * PrivateRoute guarda la ruta intentada en location.state.from.
   * Si existe, redirigimos ahí. Si no, al dashboard por defecto.
   * Esto da la experiencia: "intento /reportes → login → /reportes"
   */
  const from = (location.state as { from?: string })?.from ?? AUTH_CONFIG.ROUTES.DASHBOARD

  // Si por algún motivo ya está autenticado, redirigir
  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true })
  }, [isAuthenticated, from, navigate])

  // Limpiar error del contexto cuando el usuario empiece a escribir
  const handleFieldChange = (field: keyof FormFields, value: string) => {
    setFields(prev => ({ ...prev, [field]: value }))
    if (error) clearError()
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: undefined }))
  }

  /**
   * Validación del lado del cliente.
   *
   * ¿Por qué validar en el cliente si el servicio también valida?
   * UX: el usuario recibe feedback instantáneo sin esperar al servidor.
   * Seguridad: el servidor SIEMPRE debe validar también. El cliente
   * puede ser bypasseado. Cliente = UX, Servidor = seguridad real.
   */
  const validate = (): boolean => {
    const errors: FormErrors = {}

    if (!fields.username.trim()) {
      errors.username = 'El usuario es obligatorio'
    }
    if (!fields.password) {
      errors.password = 'La contraseña es obligatoria'
    } else if (fields.password.length < 4) {
      errors.password = 'Mínimo 4 caracteres'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // evitar recarga de página (comportamiento default del form)
    if (!validate()) return
    await login(fields)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Error global del servidor */}
      {error && (
        <Alert
          message={error}
          variant="error"
          onDismiss={clearError}
        />
      )}

      {/* Campo: usuario */}
      <div className="space-y-1.5">
        <label htmlFor="username" className="block text-sm font-medium text-slate-300">
          Usuario
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          autoFocus
          value={fields.username}
          onChange={e => handleFieldChange('username', e.target.value)}
          placeholder="admin"
          className={`
            w-full px-4 py-2.5 rounded-lg text-sm
            bg-slate-800/60 border text-slate-100
            placeholder:text-slate-600
            focus:outline-none focus:ring-2 focus:ring-indigo-500/50
            transition-all duration-150
            ${formErrors.username ? 'border-red-500/60' : 'border-slate-700'}
          `}
        />
        {formErrors.username && (
          <p className="text-xs text-red-400">{formErrors.username}</p>
        )}
      </div>

      {/* Campo: contraseña */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-slate-300">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={fields.password}
            onChange={e => handleFieldChange('password', e.target.value)}
            placeholder="••••"
            className={`
              w-full px-4 py-2.5 pr-12 rounded-lg text-sm
              bg-slate-800/60 border text-slate-100
              placeholder:text-slate-600
              focus:outline-none focus:ring-2 focus:ring-indigo-500/50
              transition-all duration-150
              ${formErrors.password ? 'border-red-500/60' : 'border-slate-700'}
            `}
          />
          <button
            type="button"
            onClick={() => setShowPassword(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors text-xs"
          >
            {showPassword ? 'Ocultar' : 'Ver'}
          </button>
        </div>
        {formErrors.password && (
          <p className="text-xs text-red-400">{formErrors.password}</p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full mt-2"
      >
        {isLoading ? 'Iniciando sesión…' : 'Iniciar sesión'}
      </Button>

      {/* Hint de credenciales — solo en desarrollo */}
      {import.meta.env.DEV && (
        <p className="text-center text-xs text-slate-600">
          Demo: <code className="text-indigo-400">admin / 1234</code>
          {' '}·{' '}
          <code className="text-indigo-400">user / 1234</code>
        </p>
      )}
    </form>
  )
}
