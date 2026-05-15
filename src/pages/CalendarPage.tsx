/**
 * PAGES / CalendarPage.tsx
 *
 * Calendario de entregas responsivo y más grande.
 * Vista Mes: celdas con altura generosa, chips de pedido legibles.
 * Vista Semana: columnas anchas con cards completas.
 * Panel lateral de detalle colapsa abajo en móvil.
 */
import { useState, useMemo } from 'react'
import { useOrders } from '@/context/OrderContext'
import type { Order, OrderStatus } from '@/models/order.model'

// ── Helpers ───────────────────────────────────────────────────

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth()    === b.getMonth()    &&
  a.getDate()     === b.getDate()

const STATUS_COLOR: Record<OrderStatus, string> = {
  CREADO:    'bg-slate-700/80 text-slate-300 border-slate-600',
  LAVANDO:   'bg-blue-500/25 text-blue-300 border-blue-500/30',
  LISTO:     'bg-emerald-500/25 text-emerald-300 border-emerald-500/30',
  ENTREGADO: 'bg-slate-600/20 text-slate-500 border-slate-700',
}

const STATUS_DOT: Record<OrderStatus, string> = {
  CREADO: 'bg-slate-400', LAVANDO: 'bg-blue-400',
  LISTO: 'bg-emerald-400', ENTREGADO: 'bg-slate-600',
}

const SERVICE_SHORT: Record<string, string> = {
  LAVADO: 'Lav', SECADO: 'Sec', COMPLETO: 'Comp', ENCARGO: 'Enc',
}

const WEEK_DAYS_LONG  = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']
const WEEK_DAYS_SHORT = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAY_NAMES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

// ── Vista MES ─────────────────────────────────────────────────

interface MonthViewProps {
  year: number; month: number
  ordersMap: Map<string, Order[]>
  today: Date
  onDayClick: (d: Date) => void
  selectedDate: Date | null
}

const MonthView = ({ year, month, ordersMap, today, onDayClick, selectedDate }: MonthViewProps) => {
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (Date | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div>
      {/* Días de la semana */}
      <div className="grid grid-cols-7 mb-2">
        {WEEK_DAYS_SHORT.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-slate-500 py-2
            hidden sm:block">{d}</div>
        ))}
        {/* Versión abreviada en móvil */}
        {['L','M','X','J','V','S','D'].map(d => (
          <div key={d} className="text-center text-xs font-semibold text-slate-500 py-2
            sm:hidden">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-800 rounded-2xl overflow-hidden border border-slate-800">
        {cells.map((date, i) => {
          if (!date) return <div key={i} className="bg-slate-950 min-h-[80px] sm:min-h-[110px]" />

          const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
          const dayOrders  = ordersMap.get(key) ?? []
          const isToday    = isSameDay(date, today)
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false
          const isPast     = date < today && !isToday

          return (
            <button key={i} onClick={() => onDayClick(date)}
              className={`bg-slate-900 min-h-[80px] sm:min-h-[110px] p-1.5 sm:p-2 text-left
                transition-colors hover:bg-slate-800/60 group
                ${isSelected ? 'ring-2 ring-inset ring-indigo-500 bg-indigo-950/20' : ''}
                ${isPast ? 'opacity-40' : ''}`}
            >
              {/* Número del día */}
              <span className={`inline-flex items-center justify-center w-7 h-7 text-xs sm:text-sm
                rounded-full mb-1 font-semibold transition-colors
                ${isToday
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 group-hover:text-white'}`}>
                {date.getDate()}
              </span>

              {/* Chips de pedidos — escritorio: texto; móvil: solo dots */}
              <div className="hidden sm:block space-y-1">
                {dayOrders.slice(0, 3).map(o => (
                  <div key={o.id}
                    className={`text-[11px] px-1.5 py-0.5 rounded-md border truncate font-medium
                      leading-tight ${STATUS_COLOR[o.status]}`}
                    title={`${o.customerName} — ${o.status}`}>
                    {SERVICE_SHORT[o.serviceType]} · {o.customerName.split(' ')[0]}
                  </div>
                ))}
                {dayOrders.length > 3 && (
                  <div className="text-[10px] text-slate-500 pl-1">+{dayOrders.length - 3} más</div>
                )}
              </div>

              {/* Móvil: solo dots de colores */}
              {dayOrders.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1 sm:hidden">
                  {dayOrders.slice(0, 4).map(o => (
                    <span key={o.id} className={`w-2 h-2 rounded-full ${STATUS_DOT[o.status]}`} />
                  ))}
                  {dayOrders.length > 4 && (
                    <span className="text-[9px] text-slate-500">+{dayOrders.length - 4}</span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Vista SEMANA ──────────────────────────────────────────────

interface WeekViewProps {
  weekStart: Date
  ordersMap: Map<string, Order[]>
  today: Date
  onDayClick: (d: Date) => void
  selectedDate: Date | null
}

const WeekView = ({ weekStart, ordersMap, today, onDayClick, selectedDate }: WeekViewProps) => {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d
  })

  return (
    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
      {days.map((date, i) => {
        const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
        const dayOrders  = ordersMap.get(key) ?? []
        const isToday    = isSameDay(date, today)
        const isSelected = selectedDate ? isSameDay(date, selectedDate) : false

        return (
          <button key={i} onClick={() => onDayClick(date)}
            className={`bg-slate-900 border rounded-xl p-1.5 sm:p-3 text-left
              transition-colors hover:border-slate-600 min-h-[120px] sm:min-h-[180px]
              ${isSelected ? 'border-indigo-500 bg-indigo-950/20' : 'border-slate-800'}
              ${isToday ? 'ring-2 ring-indigo-600/30' : ''}`}
          >
            {/* Cabecera del día */}
            <div className="mb-2 text-center">
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
                <span className="hidden sm:inline">{WEEK_DAYS_LONG[i].slice(0,3)}</span>
                <span className="sm:hidden">{['L','M','X','J','V','S','D'][i]}</span>
              </p>
              <span className={`inline-flex items-center justify-center
                w-7 h-7 sm:w-8 sm:h-8 rounded-full text-sm sm:text-base font-bold mt-0.5
                ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}>
                {date.getDate()}
              </span>
            </div>

            {/* Pedidos del día */}
            <div className="space-y-1">
              {dayOrders.map(o => (
                <div key={o.id}
                  className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-1 sm:py-1.5
                    rounded-lg border leading-tight ${STATUS_COLOR[o.status]}`}>
                  {/* Móvil: solo dot + primera letra */}
                  <div className="sm:hidden flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[o.status]}`} />
                    <span className="truncate">{o.customerName.split(' ')[0]}</span>
                  </div>
                  {/* Escritorio: nombre completo */}
                  <div className="hidden sm:block">
                    <p className="font-medium truncate">{o.customerName.split(' ')[0]}</p>
                    <p className="opacity-60 text-[10px]">{SERVICE_SHORT[o.serviceType]}</p>
                  </div>
                </div>
              ))}
              {dayOrders.length === 0 && (
                <p className="text-[10px] text-slate-700 text-center mt-4 hidden sm:block">—</p>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ── Panel de detalle del día ──────────────────────────────────

const DayDetail = ({ date, orders, onClose }: {
  date: Date; orders: Order[]; onClose: () => void
}) => {
  const STATUS_LABEL: Record<OrderStatus, string> = {
    CREADO: 'Creado', LAVANDO: 'Lavando', LISTO: '✅ Listo', ENTREGADO: '📦 Entregado',
  }
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">{DAY_NAMES[date.getDay()]}</p>
          <h3 className="text-white font-semibold text-lg">
            {date.getDate()} de {MONTH_NAMES[date.getMonth()]}
          </h3>
          <p className="text-xs text-slate-500">
            {orders.length} pedido{orders.length !== 1 ? 's' : ''} programado{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg
            text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors">
          ✕
        </button>
      </div>

      {orders.length === 0 ? (
        <p className="text-slate-600 text-sm text-center py-6">Sin pedidos para este día</p>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {orders.map(o => (
            <div key={o.id} className={`rounded-xl px-4 py-3 border space-y-1.5 ${STATUS_COLOR[o.status]}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-white text-sm font-semibold leading-tight">{o.customerName}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_COLOR[o.status]}`}>
                  {STATUS_LABEL[o.status]}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs opacity-75">
                <span>{o.serviceType === 'ENCARGO' ? `Encargo ${o.weightKg}kg` : o.serviceType.charAt(0) + o.serviceType.slice(1).toLowerCase()}</span>
                <span>{o.deliveryType === 'DOMICILIO' ? '🛵 Domicilio' : '🏪 Sucursal'}</span>
                <span className="ml-auto font-semibold">${o.price}</span>
              </div>
              {o.notes && (
                <p className="text-xs opacity-60 italic">📝 {o.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Page principal ────────────────────────────────────────────

type CalView = 'month' | 'week'

export const CalendarPage = () => {
  const { orders } = useOrders()
  const today = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d
  }, [])

  const [view,         setView]         = useState<CalView>('month')
  const [currentDate,  setCurrentDate]  = useState(new Date(today))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Mapear pedidos por promisedDate
  const ordersMap = useMemo(() => {
    const map = new Map<string, Order[]>()
    for (const o of orders) {
      if (!o.promisedDate) continue
      if (!map.has(o.promisedDate)) map.set(o.promisedDate, [])
      map.get(o.promisedDate)!.push(o)
    }
    return map
  }, [orders])

  const navigate = (dir: -1 | 1) => {
    setSelectedDate(null)
    if (view === 'month') {
      setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + dir, 1))
    } else {
      setCurrentDate(d => { const nd = new Date(d); nd.setDate(nd.getDate() + dir * 7); return nd })
    }
  }

  const weekStart = useMemo(() => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() - (d.getDay() + 6) % 7)
    d.setHours(0, 0, 0, 0)
    return d
  }, [currentDate])

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart); d.setDate(d.getDate() + 6); return d
  }, [weekStart])

  const navTitle = view === 'month'
    ? `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    : `${weekStart.getDate()} ${MONTH_NAMES[weekStart.getMonth()].slice(0,3)} — ${weekEnd.getDate()} ${MONTH_NAMES[weekEnd.getMonth()].slice(0,3)}`

  const selectedKey = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth()+1).padStart(2,'0')}-${String(selectedDate.getDate()).padStart(2,'0')}`
    : null
  const selectedOrders = selectedKey ? (ordersMap.get(selectedKey) ?? []) : []

  const totalWithDate = orders.filter(o => !!o.promisedDate).length
  const pendingCount  = orders.filter(o => o.promisedDate && o.status !== 'ENTREGADO').length

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Calendario de entregas</h1>
          <p className="text-slate-500 text-sm">
            {totalWithDate} con fecha ·
            <span className="text-amber-400 ml-1">{pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}</span>
          </p>
        </div>
        {/* Toggle mes/semana */}
        <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1 self-start sm:self-auto">
          {(['month', 'week'] as CalView[]).map(v => (
            <button key={v} onClick={() => { setView(v); setSelectedDate(null) }}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${view === v ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
              {v === 'month' ? '📅 Mes' : '📆 Semana'}
            </button>
          ))}
        </div>
      </div>

      {/* Navegación */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl
            bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-lg">
          ‹
        </button>
        <button onClick={() => { setCurrentDate(new Date(today)); setSelectedDate(today) }}
          className="px-3 py-2 text-xs sm:text-sm bg-slate-800 hover:bg-slate-700
            text-slate-300 rounded-xl transition-colors font-medium">
          Hoy
        </button>
        <button onClick={() => navigate(1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl
            bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-lg">
          ›
        </button>
        <h2 className="text-white font-semibold ml-1 text-sm sm:text-base">{navTitle}</h2>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { label: 'Creado',    cls: 'bg-slate-700/80 text-slate-300 border-slate-600' },
          { label: 'Lavando',   cls: 'bg-blue-500/25 text-blue-300 border-blue-500/30' },
          { label: 'Listo',     cls: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/30' },
          { label: 'Entregado', cls: 'bg-slate-600/20 text-slate-500 border-slate-700' },
        ].map(l => (
          <span key={l.label}
            className={`px-2.5 py-1 rounded-lg border font-medium ${l.cls}`}>
            {l.label}
          </span>
        ))}
        <span className="text-slate-600 text-xs self-center ml-auto hidden sm:block">
          Solo pedidos con fecha de entrega asignada
        </span>
      </div>

      {/* Calendario */}
      <div>
        {view === 'month' ? (
          <MonthView
            year={currentDate.getFullYear()} month={currentDate.getMonth()}
            ordersMap={ordersMap} today={today}
            onDayClick={setSelectedDate} selectedDate={selectedDate}
          />
        ) : (
          <WeekView
            weekStart={weekStart} ordersMap={ordersMap} today={today}
            onDayClick={setSelectedDate} selectedDate={selectedDate}
          />
        )}
      </div>

      {/* Panel de detalle — debajo en móvil, al lado en desktop */}
      {selectedDate && (
        <div className="lg:hidden">
          <DayDetail date={selectedDate} orders={selectedOrders} onClose={() => setSelectedDate(null)} />
        </div>
      )}

      {/* En desktop el panel aparece como overlay lateral si hay selección */}
      {selectedDate && (
        <div className="hidden lg:block fixed right-6 top-20 w-80 z-30 shadow-2xl">
          <DayDetail date={selectedDate} orders={selectedOrders} onClose={() => setSelectedDate(null)} />
        </div>
      )}

      {totalWithDate === 0 && (
        <div className="text-center py-16 text-slate-600">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-sm">Aún no hay pedidos con fecha de entrega.</p>
          <p className="text-xs mt-1">Asigna una "Fecha prometida" al crear o editar un pedido.</p>
        </div>
      )}
    </div>
  )
}
