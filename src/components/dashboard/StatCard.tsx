/**
 * StatCard — tarjeta de métrica con icono, título y valor.
 * Acepta "trend" para mostrar si sube o baja respecto a un período.
 */
interface StatCardProps {
  title: string
  value: string | number
  icon?: string
  subtitle?: string
  /** 'up' = verde, 'down' = rojo, undefined = neutro */
  trend?: 'up' | 'down'
  adminOnly?: boolean  // si true, se oculta visualmente cuando no es admin
  hidden?: boolean
}

export const StatCard = ({ title, value, icon, subtitle, trend, hidden }: StatCardProps) => {
  if (hidden) return null

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400 font-medium">{title}</p>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtitle && (
        <p className={`text-xs font-medium ${
          trend === 'up'   ? 'text-emerald-400' :
          trend === 'down' ? 'text-red-400'     : 'text-slate-500'
        }`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
