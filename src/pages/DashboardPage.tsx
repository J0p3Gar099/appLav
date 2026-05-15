/**
 * PAGES / DashboardPage.tsx
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOrders } from '@/context/OrderContext'
import { useCosts } from '@/context/CostContext'
import { usePermissions } from '@/hooks/usePermissions'
import { useStats } from '@/hooks/useStats'
import { StatCard } from '@/components/dashboard/StatCard'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { AddCostModal } from '@/components/costs/AddCostModal'

type TabKey = 'day' | 'week' | 'month'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'day',   label: 'Hoy' },
  { key: 'week',  label: 'Semana' },
  { key: 'month', label: 'Mes' },
]

const STATUS_LABELS: Record<string, string> = {
  CREADO:    'Creado',
  LAVANDO:   'Lavando',
  LISTO:     'Listo',
  ENTREGADO: 'Entregado',
}

const STATUS_COLORS: Record<string, string> = {
  CREADO:    'bg-slate-700 text-slate-300',
  LAVANDO:   'bg-blue-500/20 text-blue-400',
  LISTO:     'bg-emerald-500/20 text-emerald-400',
  ENTREGADO: 'bg-slate-600/40 text-slate-400',
}

export const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('day')
  const [showCostModal, setShowCostModal] = useState(false)

  const { orders } = useOrders()
  const { costs }  = useCosts()
  const { isAdmin } = usePermissions()
  const stats = useStats(orders, costs)

  const current = {
    income:  stats.income[activeTab === 'day'  ? 'daily' : activeTab === 'week' ? 'weekly' : 'monthly'],
    costs:   stats.costs[activeTab === 'day'   ? 'daily' : activeTab === 'week' ? 'weekly' : 'monthly'],
    profit:  stats.profit[activeTab === 'day'  ? 'daily' : activeTab === 'week' ? 'weekly' : 'monthly'],
    orders:  stats.orders[activeTab === 'day'  ? 'daily' : activeTab === 'week' ? 'weekly' : 'monthly'],
  }

  const pending = orders.filter(o => o.status !== 'ENTREGADO').slice(0, 6)

  const cardVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.97 },
    visible: (i: number) => ({
      opacity: 1, y: 0, scale: 1,
      transition: { delay: i * 0.06, type: 'spring', stiffness: 380, damping: 28 },
    }),
  }

  return (
    <motion.div
      className="space-y-6 max-w-5xl mx-auto"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-500 text-sm">Resumen de actividad de la lavandería</p>
        </div>
        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowCostModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700
              border border-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
          >
            <span>➕</span> Registrar costo
          </motion.button>
        )}
      </div>

      {/* Tabs de período */}
      <div className="relative border-b border-slate-800">
        <div className="flex gap-1">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-5 py-2.5 text-sm font-medium transition-colors duration-200
                ${activeTab === tab.key ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <motion.span
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          initial="hidden"
          animate="visible"
          variants={{ visible: {} }}
        >
          {[
            { title: 'Pedidos',   value: current.orders,  icon: '🧺', subtitle: `en ${activeTab === 'day' ? 'el día' : activeTab === 'week' ? 'la semana' : 'el mes'}`, hidden: false },
            { title: 'Ingresos',  value: `$${current.income.toLocaleString()}`,  icon: '💰', subtitle: 'pedidos pagados',   trend: 'up'   as const, hidden: !isAdmin },
            { title: 'Costos',    value: `$${current.costs.toLocaleString()}`,   icon: '💸', subtitle: 'gastos operativos', trend: 'down' as const, hidden: !isAdmin },
            { title: 'Utilidad',  value: `$${current.profit.toLocaleString()}`,  icon: current.profit >= 0 ? '📈' : '📉', subtitle: 'ingresos - costos', trend: current.profit >= 0 ? 'up' as const : 'down' as const, hidden: !isAdmin },
          ].map((card, i) => (
            <motion.div key={card.title} custom={i} variants={cardVariants} initial="hidden" animate="visible">
              <StatCard {...card} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pedidos activos / por cobrar */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { title: 'Pedidos activos', value: stats.orders.pending, icon: '⏳', subtitle: 'sin entregar' },
          { title: 'Por cobrar',      value: stats.orders.unpaid,  icon: '💳', subtitle: 'pendientes de pago' },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
          >
            <StatCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* ── Gráfica de ingresos vs costos (solo admin) ── */}
      {isAdmin && <RevenueChart />}

      {/* Pedidos activos recientes */}
      <motion.div
        className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-300">Pedidos activos</h2>
          <span className="text-xs text-slate-600">{pending.length} mostrando</span>
        </div>
        {pending.length === 0 ? (
          <div className="px-5 py-8 text-center text-slate-600 text-sm">
            No hay pedidos activos 🎉
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            <AnimatePresence>
              {pending.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.04 }}
                  className="px-5 py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{order.customerName}</p>
                    <p className="text-xs text-slate-500">{order.serviceType}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {isAdmin && (
                      <span className="text-sm font-semibold text-white">${order.price}</span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showCostModal && <AddCostModal onClose={() => setShowCostModal(false)} />}
      </AnimatePresence>
    </motion.div>
  )
}
