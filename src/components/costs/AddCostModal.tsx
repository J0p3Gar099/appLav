/**
 * AddCostModal — modal para registrar un costo operativo.
 * Solo lo usa el admin. Se llama desde el Dashboard y CostsPage.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCosts } from '@/context/CostContext'
import type { CostCategory } from '@/models/cost.model'

const CATEGORIES: { value: CostCategory; label: string; color: string }[] = [
  { value: 'DETERGENTE',    label: '🧴 Detergente',    color: 'text-blue-400' },
  { value: 'AGUA',          label: '💧 Agua',           color: 'text-cyan-400' },
  { value: 'LUZ',           label: '💡 Luz',            color: 'text-yellow-400' },
  { value: 'MANTENIMIENTO', label: '🔧 Mantenimiento',  color: 'text-orange-400' },
  { value: 'NOMINA',        label: '👷 Nómina',         color: 'text-purple-400' },
  { value: 'RENTA',         label: '🏠 Renta',          color: 'text-rose-400' },
  { value: 'TRANSPORTE',    label: '🚚 Transporte',     color: 'text-emerald-400' },
  { value: 'INSUMOS',       label: '📦 Insumos',        color: 'text-indigo-400' },
  { value: 'OTRO',          label: '🗂️ Otro',           color: 'text-slate-400' },
]

interface Props { onClose: () => void }

export const AddCostModal = ({ onClose }: Props) => {
  const { addCost } = useCosts()
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<CostCategory>('DETERGENTE')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return setError('La descripción es obligatoria')
    if (!amount || Number(amount) <= 0) return setError('El monto debe ser mayor a 0')
    addCost({ description: description.trim(), amount: Number(amount), category, date })
    setSuccess(true)
    setTimeout(() => onClose(), 700)
  }

  const inputClass = "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
  const labelClass = "block text-xs font-medium text-slate-400 mb-1.5"

  const selectedCat = CATEGORIES.find(c => c.value === category)

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        initial={{ scale: 0.94, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 20 }}
        transition={{ type: 'spring' as const, stiffness: 380, damping: 32 }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="font-semibold text-white">Registrar costo</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-10 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 20, delay: 0.1 }}
                className="text-5xl mb-3"
              >
                ✅
              </motion.div>
              <p className="text-white font-medium">Costo registrado</p>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handleSubmit} className="p-6 space-y-4">
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Categorías como grid de chips */}
              <div>
                <label className={labelClass}>Categoría</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`text-xs px-2 py-2 rounded-lg border transition-all font-medium text-left
                        ${category === cat.value
                          ? 'border-indigo-500 bg-indigo-500/10 text-white'
                          : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                        }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Descripción</label>
                <input
                  value={description}
                  onChange={e => { setDescription(e.target.value); setError('') }}
                  placeholder={`ej: ${category === 'RENTA' ? 'Renta mayo 2025' : category === 'NOMINA' ? 'Quincena empleados' : 'Detergente marca X 5kg'}`}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Monto ($)</label>
                  <input
                    type="number" min="1" value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00" className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Fecha</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-400 text-sm hover:bg-slate-800 transition-colors">
                  Cancelar
                </button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                >
                  Guardar
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
