/**
 * PAGES / CostsPage.tsx — solo admin.
 * Historial de costos operativos con filtros por categoría y animaciones.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCosts } from '@/context/CostContext'
import { useOrders } from '@/context/OrderContext'
import { AddCostModal } from '@/components/costs/AddCostModal'
import { exportCostsCSV, exportFullReportCSV } from '@/utils/export.utils'
import type { CostCategory } from '@/models/cost.model'

const CATEGORY_INFO: Record<CostCategory, { label: string; color: string; bg: string }> = {
  DETERGENTE:    { label: '🧴 Detergente',   color: 'text-blue-400',    bg: 'bg-blue-500/10' },
  AGUA:          { label: '💧 Agua',          color: 'text-cyan-400',    bg: 'bg-cyan-500/10' },
  LUZ:           { label: '💡 Luz',           color: 'text-yellow-400',  bg: 'bg-yellow-500/10' },
  MANTENIMIENTO: { label: '🔧 Mantenimiento', color: 'text-orange-400',  bg: 'bg-orange-500/10' },
  NOMINA:        { label: '👷 Nómina',        color: 'text-purple-400',  bg: 'bg-purple-500/10' },
  RENTA:         { label: '🏠 Renta',         color: 'text-rose-400',    bg: 'bg-rose-500/10' },
  TRANSPORTE:    { label: '🚚 Transporte',    color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  INSUMOS:       { label: '📦 Insumos',       color: 'text-indigo-400',  bg: 'bg-indigo-500/10' },
  OTRO:          { label: '🗂️ Otro',          color: 'text-slate-400',   bg: 'bg-slate-700/40' },
}

export const CostsPage = () => {
  const { costs, deleteCost } = useCosts()
  const { orders }            = useOrders()
  const [showModal,  setShowModal]  = useState(false)
  const [filterCat,  setFilterCat]  = useState<CostCategory | 'ALL'>('ALL')

  const handleExportCosts  = () => exportCostsCSV(costs, 'costos_operativos')
  const handleExportReport = () => exportFullReportCSV(orders, costs, 'reporte_lavanderia')

  const total = costs.reduce((acc, c) => acc + c.amount, 0)

  // Totales por categoría
  const byCategory = Object.keys(CATEGORY_INFO).reduce((acc, cat) => {
    acc[cat as CostCategory] = costs
      .filter(c => c.category === cat)
      .reduce((sum, c) => sum + c.amount, 0)
    return acc
  }, {} as Record<CostCategory, number>)

  const filtered = filterCat === 'ALL'
    ? costs
    : costs.filter(c => c.category === filterCat)

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 30 } },
    exit: { opacity: 0, x: -16, transition: { duration: 0.16 } },
  }

  return (
    <motion.div
      className="space-y-5 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Costos operativos</h1>
          <p className="text-slate-500 text-sm">
            Total registrado: <span className="text-white font-semibold">${total.toLocaleString()}</span>
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500
            text-white text-sm font-medium rounded-lg transition-colors"
        >
          <span>➕</span> Registrar costo
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleExportCosts}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700
              border border-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
            title="Exportar costos a CSV"
          >
            📥 Costos CSV
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleExportReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700
              border border-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
            title="Exportar reporte completo (pedidos + costos)"
          >
            📊 Reporte completo
          </motion.button>
        </div>

      {/* Resumen por categoría (solo las que tienen datos) */}
      {costs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.keys(CATEGORY_INFO) as CostCategory[])
            .filter(cat => byCategory[cat] > 0)
            .map(cat => {
              const info = CATEGORY_INFO[cat]
              return (
                <motion.button
                  key={cat}
                  onClick={() => setFilterCat(filterCat === cat ? 'ALL' : cat)}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className={`text-left p-3 rounded-xl border transition-all
                    ${filterCat === cat
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : `border-slate-800 ${info.bg} hover:border-slate-700`
                    }`}
                >
                  <p className={`text-xs font-medium ${info.color}`}>{info.label}</p>
                  <p className="text-white font-semibold text-sm mt-0.5">${byCategory[cat].toLocaleString()}</p>
                </motion.button>
              )
            })
          }
        </div>
      )}

      {/* Filtro activo badge */}
      {filterCat !== 'ALL' && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Filtrando por:</span>
          <button
            onClick={() => setFilterCat('ALL')}
            className="flex items-center gap-1.5 text-xs bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-500/30 hover:bg-indigo-500/20 transition-colors"
          >
            {CATEGORY_INFO[filterCat].label} <span>✕</span>
          </button>
        </div>
      )}

      {/* Lista */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-900 border border-slate-800 rounded-xl py-12 text-center"
        >
          <p className="text-4xl mb-3">💸</p>
          <p className="text-slate-500 text-sm">
            {costs.length === 0 ? 'No hay costos registrados' : 'No hay costos en esta categoría'}
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-2"
          initial="hidden"
          animate="visible"
          key={filterCat}
          variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map(cost => {
              const info = CATEGORY_INFO[cost.category]
              return (
                <motion.div
                  key={cost.id}
                  variants={itemVariants}
                  exit="exit"
                  layout
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl px-5 py-4 flex items-center gap-4 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-lg ${info.bg} flex items-center justify-center text-lg shrink-0`}>
                    {info.label.split(' ')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{cost.description}</p>
                    <div className="flex gap-3 text-xs text-slate-500 mt-0.5">
                      <span className={info.color}>{info.label.split(' ').slice(1).join(' ')}</span>
                      <span>{new Date(cost.date).toLocaleDateString('es-MX')}</span>
                    </div>
                  </div>
                  <p className="text-white font-semibold shrink-0">${cost.amount.toLocaleString()}</p>
                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => confirm('¿Eliminar costo?') && deleteCost(cost.id)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-slate-800 transition-colors shrink-0"
                  >
                    🗑️
                  </motion.button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {showModal && <AddCostModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </motion.div>
  )
}
