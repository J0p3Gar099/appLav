/**
 * PAGES / AttendancePage.tsx
 *
 * Muestra el registro de sesiones (login / logout) de los empleados.
 * Indicadores de color:
 *   🟢 Verde   — entró a tiempo (antes de las 9:00)
 *   🟡 Amarillo — retardo (entre 9:01 y 9:30)
 *   🔴 Rojo    — falta / entrada muy tardía (después de las 9:30 o sin registro)
 *
 * Solo accesible para admin.
 */
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAttendance } from '@/context/AttendanceContext'
import type { AttendanceEntry } from '@/models/attendance.model'

// ── Configuración de horario ─────────────────────────────────
const WORK_START_HOUR   = 9   // 09:00
const WORK_START_MINUTE = 0
const LATE_LIMIT_HOUR   = 9   // hasta 09:30 es retardo
const LATE_LIMIT_MINUTE = 30

type AttendanceStatus = 'on_time' | 'late' | 'very_late'

function getAttendanceStatus(loginAt: string): AttendanceStatus {
  const d    = new Date(loginAt)
  const h    = d.getHours()
  const m    = d.getMinutes()
  const mins = h * 60 + m
  const startMins = WORK_START_HOUR * 60 + WORK_START_MINUTE
  const lateMins  = LATE_LIMIT_HOUR * 60 + LATE_LIMIT_MINUTE

  if (mins <= startMins) return 'on_time'
  if (mins <= lateMins)  return 'late'
  return 'very_late'
}

const STATUS_META: Record<AttendanceStatus, { label: string; dot: string; row: string; badge: string }> = {
  on_time:   {
    label: 'A tiempo',
    dot:   'bg-emerald-400',
    row:   'border-l-emerald-500/40',
    badge: 'bg-emerald-500/15 text-emerald-400',
  },
  late:      {
    label: 'Retardo',
    dot:   'bg-amber-400',
    row:   'border-l-amber-500/40',
    badge: 'bg-amber-500/15 text-amber-400',
  },
  very_late: {
    label: 'Tardanza',
    dot:   'bg-red-400',
    row:   'border-l-red-500/40',
    badge: 'bg-red-500/15 text-red-400',
  },
}

function fmt(iso: string) {
  return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
}
function duration(entry: AttendanceEntry): string {
  if (!entry.logoutAt) return '—'
  const ms = new Date(entry.logoutAt).getTime() - new Date(entry.loginAt).getTime()
  const h  = Math.floor(ms / 3_600_000)
  const m  = Math.floor((ms % 3_600_000) / 60_000)
  return `${h}h ${m}m`
}

type FilterPeriod = 'ALL' | 'TODAY' | 'WEEK' | 'MONTH'

function startOf(unit: 'day' | 'week' | 'month', d = new Date()): Date {
  const r = new Date(d)
  if (unit === 'day')   { r.setHours(0, 0, 0, 0); return r }
  if (unit === 'week')  {
    r.setHours(0, 0, 0, 0)
    r.setDate(r.getDate() - (r.getDay() === 0 ? 6 : r.getDay() - 1))
    return r
  }
  return new Date(r.getFullYear(), r.getMonth(), 1)
}

export function AttendancePage() {
  const { entries } = useAttendance()
  const [period, setPeriod] = useState<FilterPeriod>('TODAY')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const now = new Date()
    let list = [...entries]

    if (period === 'TODAY') list = list.filter(e => new Date(e.loginAt) >= startOf('day', now))
    if (period === 'WEEK')  list = list.filter(e => new Date(e.loginAt) >= startOf('week', now))
    if (period === 'MONTH') list = list.filter(e => new Date(e.loginAt) >= startOf('month', now))

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(e =>
        e.userName.toLowerCase().includes(q) ||
        e.userRole.toLowerCase().includes(q)
      )
    }

    return list
  }, [entries, period, search])

  // Resumen de estados
  const summary = useMemo(() => {
    let onTime = 0, late = 0, veryLate = 0
    for (const e of filtered) {
      const s = getAttendanceStatus(e.loginAt)
      if (s === 'on_time')   onTime++
      else if (s === 'late') late++
      else                   veryLate++
    }
    return { onTime, late, veryLate, total: filtered.length }
  }, [filtered])

  const PERIODS: { value: FilterPeriod; label: string }[] = [
    { value: 'TODAY', label: 'Hoy' },
    { value: 'WEEK',  label: 'Esta semana' },
    { value: 'MONTH', label: 'Este mes' },
    { value: 'ALL',   label: 'Todo' },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Asistencia</h1>
        <p className="text-sm text-slate-400 mt-1">
          Registro de entradas y salidas del equipo
        </p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 text-center">
          <div className="text-2xl font-bold text-emerald-400">{summary.onTime}</div>
          <div className="text-xs text-slate-400 mt-1">A tiempo</div>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 text-center">
          <div className="text-2xl font-bold text-amber-400">{summary.late}</div>
          <div className="text-xs text-slate-400 mt-1">Retardos</div>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 text-center">
          <div className="text-2xl font-bold text-red-400">{summary.veryLate}</div>
          <div className="text-xs text-slate-400 mt-1">Tardanzas</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 bg-slate-800/60 rounded-lg p-1 border border-slate-700/50">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                period === p.value
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Buscar empleado..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] bg-slate-800/60 border border-slate-700/50 rounded-lg
            px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none
            focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Leyenda */}
      <div className="flex gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> A tiempo (antes de las 9:00)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Retardo (9:01–9:30)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Tardanza (después de 9:30)
        </span>
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-4xl mb-3">🕐</p>
          <p className="text-sm">No hay registros para este período.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry, idx) => {
            const status = getAttendanceStatus(entry.loginAt)
            const meta   = STATUS_META[status]

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`
                  bg-slate-800/60 rounded-xl p-4 border border-slate-700/50
                  border-l-4 ${meta.row}
                `}
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  {/* Info del empleado */}
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${meta.dot}`} />
                    <div>
                      <p className="text-sm font-medium text-white">{entry.userName}</p>
                      <p className="text-xs text-slate-500 capitalize">{entry.userRole}</p>
                    </div>
                  </div>

                  {/* Horarios */}
                  <div className="flex items-center gap-6 text-xs">
                    <div className="text-center">
                      <p className="text-slate-400">Entrada</p>
                      <p className="text-white font-medium">{fmt(entry.loginAt)}</p>
                      <p className="text-slate-500">{fmtDate(entry.loginAt)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400">Salida</p>
                      <p className={`font-medium ${entry.logoutAt ? 'text-white' : 'text-slate-600'}`}>
                        {entry.logoutAt ? fmt(entry.logoutAt) : 'Activo'}
                      </p>
                      {entry.logoutAt && (
                        <p className="text-slate-500">{fmtDate(entry.logoutAt)}</p>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400">Duración</p>
                      <p className="text-white font-medium">{duration(entry)}</p>
                    </div>
                  </div>

                  {/* Badge de estado */}
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${meta.badge}`}>
                    {meta.label}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
