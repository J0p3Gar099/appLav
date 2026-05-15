/**
 * PAGES / LoginPage.tsx
 *
 * Página de login. Es un componente "contenedor de layout":
 * solo define la estructura visual de la página y renderiza
 * LoginForm, que contiene toda la lógica del formulario.
 *
 * Separar page de form nos permite reutilizar LoginForm en otros
 * contextos (modal, drawer) sin duplicar el layout de página.
 */
import { LoginForm } from '@/components/auth/LoginForm'

export function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Fondo con patrón de puntos sutil */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'radial-gradient(circle, #818cf8 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Card principal */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-white text-2xl">
              🔐
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Bienvenido de vuelta
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <LoginForm />
        </div>

        {/* Footer de la card */}
        <p className="text-center text-xs text-slate-700 mt-6">
          Auth App · Proyecto de aprendizaje React + TypeScript
        </p>
      </div>
    </div>
  )
}
