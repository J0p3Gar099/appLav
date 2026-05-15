/**
 * COMPONENTS/DASHBOARD / RevenueChart.tsx
 *
 * Gráfica de ingresos vs costos con Recharts.
 * - 3 series: Ingresos (azul), Costos (rojo), Utilidad (verde)
 * - 3 rangos: Semana / Mes / 6 meses
 * - Tooltip personalizado con fondo oscuro
 * - Responsive vía ResponsiveContainer
 * - Animaciones de entrada en barras
 *
 * Requiere: npm install recharts
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useOrders } from '@/context/OrderContext'
import { useCosts } from '@/context/CostContext'
import { useChartData, type ChartRange } from '@/hooks/useChartData'

// ── Tooltip personalizado ─────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null

  const items = [
    { key: 'ingresos', label: 'Ingresos', color: '#6366f1' },
    { key: 'costos',   label: 'Costos',   color: '#f43f5e' },
    { key: 'utilidad', label: 'Utilidad', color: '#10b981' },
  ]

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 shadow-xl min-w-[140px]">
      <p className="text-xs font-medium text-slate-400 mb-2">{label}</p>
      {items.map(item => {
        const val = payload.find((p: any) => p.dataKey === item.key)?.value ?? 0
        return (
          <div key={item.key} className="flex items-center justify-between gap-4 py-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
              <span className="text-xs text-slate-400">{item.label}</span>
            </div>
            <span className={`text-xs font-semibold ${
              item.key === 'utilidad'
                ? val >= 0 ? 'text-emerald-400' : 'text-red-400'
                : 'text-white'
            }`}>
              ${val.toLocaleString('es-MX')}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Leyenda personalizada ─────────────────────────────────────

const CustomLegend = () => (
  <div className="flex justify-center gap-5 mt-2">
    {[
      { color: '#6366f1', label: 'Ingresos' },
      { color: '#f43f5e', label: 'Costos' },
      { color: '#10b981', label: 'Utilidad' },
    ].map(item => (
      <div key={item.label} className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-sm" style={{ background: item.color }} />
        <span className="text-xs text-slate-400">{item.label}</span>
      </div>
    ))}
  </div>
)

// ── Tabs de rango ─────────────────────────────────────────────

const RANGES: { key: ChartRange; label: string }[] = [
  { key: 'week',     label: 'Semana' },
  { key: 'month',    label: 'Mes' },
  { key: '6months',  label: '6 meses' },
]

// ── Componente principal ──────────────────────────────────────

export const RevenueChart = () => {
  const [range, setRange] = useState<ChartRange>('week')
  const { orders } = useOrders()
  const { costs }  = useCosts()
  const data = useChartData(orders, costs, range)

  // Calcular totales del período para el resumen
  const totals = data.reduce(
    (acc, d) => ({
      ingresos: acc.ingresos + d.ingresos,
      costos:   acc.costos   + d.costos,
      utilidad: acc.utilidad + d.utilidad,
    }),
    { ingresos: 0, costos: 0, utilidad: 0 }
  )

  const hasData = data.some(d => d.ingresos > 0 || d.costos > 0)

  return (
    <motion.div
      className="bg-slate-900 border border-slate-800 rounded-xl p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">Ingresos vs Costos</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Utilidad del período:{' '}
            <span className={`font-semibold ${totals.utilidad >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ${totals.utilidad.toLocaleString('es-MX')}
            </span>
          </p>
        </div>

        {/* Tabs de rango */}
        <div className="flex bg-slate-800 rounded-lg p-0.5 self-start sm:self-auto">
          {RANGES.map(r => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`relative px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                ${range === r.key
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mini resumen numérico */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Ingresos', value: totals.ingresos, color: 'text-indigo-400' },
          { label: 'Costos',   value: totals.costos,   color: 'text-rose-400' },
          { label: 'Utilidad', value: totals.utilidad, color: totals.utilidad >= 0 ? 'text-emerald-400' : 'text-red-400' },
        ].map(item => (
          <div key={item.label} className="bg-slate-800/60 rounded-lg px-3 py-2.5">
            <p className="text-xs text-slate-500 mb-0.5">{item.label}</p>
            <p className={`text-sm font-semibold ${item.color}`}>
              ${item.value.toLocaleString('es-MX')}
            </p>
          </div>
        ))}
      </div>

      {/* Gráfica */}
      {!hasData ? (
        <div className="h-52 flex flex-col items-center justify-center text-slate-600">
          <p className="text-3xl mb-2">📊</p>
          <p className="text-sm">Sin datos en este período</p>
          <p className="text-xs mt-1">Registra pedidos y costos para ver la gráfica</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barGap={2} barCategoryGap="28%">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => v === 0 ? '0' : `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
              width={42}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 4 }}
            />
            <ReferenceLine y={0} stroke="#334155" strokeWidth={0.5} />
            <Bar
              dataKey="ingresos"
              fill="#6366f1"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-out"
            />
            <Bar
              dataKey="costos"
              fill="#f43f5e"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-out"
              animationBegin={80}
            />
            <Bar
              dataKey="utilidad"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-out"
              animationBegin={160}
            />
          </BarChart>
        </ResponsiveContainer>
      )}

      <CustomLegend />
    </motion.div>
  )
}
