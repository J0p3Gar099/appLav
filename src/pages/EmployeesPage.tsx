/**
 * PAGES / EmployeesPage.tsx
 *
 * Gestión de empleados — solo admin.
 * Permite crear, editar, desactivar y cambiar contraseña.
 * Como solo el admin entra aquí, todos los campos se muestran sin restricción.
 */
import { useState, useEffect } from 'react'
import { useUsers } from '@/context/UserContext'
import { useAuth } from '@/context/AuthContext'
import { useCosts } from '@/context/CostContext'
import type { Employee, Shift } from '@/models/employee.model'
import type { UserRole } from '@/models/user.model'

// ── Helpers ───────────────────────────────────────────────────

const SHIFTS: { value: Shift; label: string }[] = [
  { value: 'MAÑANA', label: '🌅 Mañana' },
  { value: 'TARDE',  label: '☀️ Tarde'  },
  { value: 'NOCHE',  label: '🌙 Noche'  },
]

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin',     label: '👑 Admin'     },
  { value: 'consultor', label: '📊 Consultor' },
  { value: 'user',      label: '👤 Empleado'  },
]

const ROLE_COLORS: Record<UserRole, string> = {
  admin:     'bg-amber-500/10 text-amber-400 border-amber-500/20',
  consultor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  user:      'bg-slate-500/10 text-slate-400 border-slate-500/20',
}

const inputClass = "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
const labelClass = "block text-xs font-medium text-slate-400 mb-1.5"

// ── Modal de formulario ───────────────────────────────────────

interface EmployeeFormProps {
  employee?: Employee
  onSave: (data: Omit<Employee, 'id' | 'createdAt'>) => void
  onClose: () => void
}

function EmployeeFormModal({ employee, onSave, onClose }: EmployeeFormProps) {
  const isEditing = !!employee

  const [firstName, setFirstName]   = useState(employee?.firstName ?? '')
  const [lastName,  setLastName]    = useState(employee?.lastName  ?? '')
  const [username,  setUsername]    = useState(employee?.username  ?? '')
  const [password,  setPassword]    = useState(employee?.password  ?? '')
  const [email,     setEmail]       = useState(employee?.email     ?? '')
  const [phone,     setPhone]       = useState(employee?.phone     ?? '')
  const [address,   setAddress]     = useState(employee?.address   ?? '')
  const [birthDate, setBirthDate]   = useState(employee?.birthDate ?? '')
  const [role,      setRole]        = useState<UserRole>(employee?.role ?? 'user')
  const [shift,     setShift]       = useState<Shift>(employee?.shift ?? 'MAÑANA')
  const [schedule,  setSchedule]    = useState(employee?.schedule  ?? '')
  const [startDate, setStartDate]   = useState(
    employee?.startDate
      ? employee.startDate.split('T')[0]
      : new Date().toISOString().split('T')[0]
  )
  const [salary,    setSalary]      = useState(employee?.salary?.toString() ?? '')
  const [isActive,  setIsActive]    = useState(employee?.isActive ?? true)
  const [error,     setError]       = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim()) return setError('El nombre es obligatorio')
    if (!username.trim())  return setError('El usuario es obligatorio')
    if (!isEditing && !password.trim()) return setError('La contraseña es obligatoria')

    onSave({
      firstName:  firstName.trim(),
      lastName:   lastName.trim(),
      username:   username.trim(),
      password:   password || employee!.password, // si no cambió, mantener la anterior
      email:      email.trim()    || undefined,
      phone:      phone.trim()    || undefined,
      address:    address.trim()  || undefined,
      birthDate:  birthDate       || undefined,
      role,
      shift,
      schedule:   schedule.trim(),
      startDate:  new Date(startDate).toISOString(),
      salary:     Number(salary) || 0,
      isActive,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <h2 className="font-semibold text-white">
            {isEditing ? 'Editar empleado' : 'Nuevo empleado'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-5">
            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            {/* Datos personales */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Datos personales
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Nombre *</label>
                  <input value={firstName} onChange={e => { setFirstName(e.target.value); setError('') }}
                    placeholder="María" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Apellido</label>
                  <input value={lastName} onChange={e => setLastName(e.target.value)}
                    placeholder="González" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Teléfono</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="55 1234 5678" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Fecha de nacimiento</label>
                  <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                    className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Dirección</label>
                  <input value={address} onChange={e => setAddress(e.target.value)}
                    placeholder="Calle, número, colonia" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Acceso al sistema */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Acceso al sistema
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Usuario *</label>
                  <input value={username} onChange={e => { setUsername(e.target.value); setError('') }}
                    placeholder="mgonzalez" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>
                    {isEditing ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
                  </label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder={isEditing ? '••••••' : 'Mínimo 4 caracteres'} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="mgonzalez@lavapp.com" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Rol *</label>
                  <select value={role} onChange={e => setRole(e.target.value as UserRole)} className={inputClass}>
                    {ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                {/* Activo/Inactivo — solo en edición */}
                {isEditing && (
                  <div className="flex items-center gap-3 sm:col-span-2">
                    <input type="checkbox" id="isActive" checked={isActive}
                      onChange={e => setIsActive(e.target.checked)}
                      className="w-4 h-4 accent-indigo-500" />
                    <label htmlFor="isActive" className="text-sm text-slate-300">
                      Empleado activo
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Datos laborales */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Datos laborales
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Turno *</label>
                  <select value={shift} onChange={e => setShift(e.target.value as Shift)} className={inputClass}>
                    {SHIFTS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Fecha de ingreso</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                    className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Horario</label>
                  <input value={schedule} onChange={e => setSchedule(e.target.value)}
                    placeholder="ej: Lun-Vie 08:00-16:00" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Paga ($)</label>
                  <input type="number" min="0" value={salary} onChange={e => setSalary(e.target.value)}
                    placeholder="0.00" className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-400 text-sm hover:bg-slate-800 transition-colors">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
              {isEditing ? 'Guardar cambios' : 'Crear empleado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Modal de cambio de contraseña ─────────────────────────────

interface ChangePasswordProps {
  employee: Employee
  onClose: () => void
}

function ChangePasswordModal({ employee, onClose }: ChangePasswordProps) {
  const { changePassword } = useUsers()
  const [newPassword,    setNewPassword]    = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 4)
      return setError('Mínimo 4 caracteres')
    if (newPassword !== confirmPassword)
      return setError('Las contraseñas no coinciden')

    changePassword(employee.id, newPassword)
    setSuccess(true)
    setTimeout(onClose, 1200)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="font-semibold text-white">Cambiar contraseña</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-slate-400">
            Cambiando contraseña de <span className="text-white font-medium">{employee.firstName} {employee.lastName}</span>
          </p>

          {error   && <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-emerald-400 text-sm bg-emerald-500/10 px-3 py-2 rounded-lg">✓ Contraseña actualizada</p>}

          <div>
            <label className={labelClass}>Nueva contraseña</label>
            <input type="password" value={newPassword}
              onChange={e => { setNewPassword(e.target.value); setError('') }}
              placeholder="Mínimo 4 caracteres"
              className={inputClass} autoFocus />
          </div>
          <div>
            <label className={labelClass}>Confirmar contraseña</label>
            <input type="password" value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setError('') }}
              placeholder="Repetir contraseña"
              className={inputClass} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-400 text-sm hover:bg-slate-800 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={success}
              className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-colors">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Modal de pago de salario ──────────────────────────────────

type PayPeriod = 'SEMANAL' | 'QUINCENAL' | 'CATORCENA' | 'MENSUAL' | 'DIAS'

const PAY_PERIODS: { value: PayPeriod; label: string; fraction: number }[] = [
  { value: 'SEMANAL',    label: 'Semanal',    fraction: 1 / 4.33 },
  { value: 'QUINCENAL',  label: 'Quincenal',  fraction: 1 / 2 },
  { value: 'CATORCENA',  label: 'Catorcena',  fraction: 14 / 30 },
  { value: 'MENSUAL',    label: 'Mensual',    fraction: 1 },
  { value: 'DIAS',       label: 'Por días',   fraction: 0 },
]

interface PaySalaryProps {
  employee: Employee
  onClose: () => void
}

function PaySalaryModal({ employee, onClose }: PaySalaryProps) {
  const { addCost } = useCosts()
  const [period, setPeriod]   = useState<PayPeriod>('MENSUAL')
  const [days,   setDays]     = useState(1)
  const [amount, setAmount]   = useState(employee.salary)
  const [success, setSuccess] = useState(false)

  // Recalculate amount whenever period or days change
  useEffect(() => {
    const sel = PAY_PERIODS.find(p => p.value === period)!
    if (period === 'DIAS') {
      setAmount(Math.round((employee.salary / 30) * days))
    } else {
      setAmount(Math.round(employee.salary * sel.fraction))
    }
  }, [period, days, employee.salary])

  const fullName = `${employee.firstName} ${employee.lastName}`.trim()

  const periodLabel = period === 'DIAS'
    ? `${days} día${days !== 1 ? 's' : ''}`
    : PAY_PERIODS.find(p => p.value === period)!.label.toLowerCase()

  const handlePay = () => {
    addCost({
      description: `Pago ${periodLabel} — ${fullName}`,
      amount,
      category: 'NOMINA',
      date: new Date().toISOString(),
    })
    setSuccess(true)
    setTimeout(onClose, 1400)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">
              {employee.firstName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{fullName}</p>
              <p className="text-xs text-slate-500">Salario base: ${employee.salary.toLocaleString()}/mes</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Período de pago */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Período de pago
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PAY_PERIODS.map(p => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors text-left
                    ${period === p.value
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Número de días — solo si período es DIAS */}
          {period === 'DIAS' && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Número de días
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDays(d => Math.max(1, d - 1))}
                  className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 text-white text-lg
                    hover:bg-slate-700 transition-colors flex items-center justify-center"
                >−</button>
                <span className="flex-1 text-center text-2xl font-bold text-white">{days}</span>
                <button
                  onClick={() => setDays(d => Math.min(30, d + 1))}
                  className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 text-white text-lg
                    hover:bg-slate-700 transition-colors flex items-center justify-center"
                >+</button>
              </div>
              <p className="text-xs text-slate-500 text-center mt-1">
                ${(employee.salary / 30).toFixed(0)} por día
              </p>
            </div>
          )}

          {/* Monto editable */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Monto a pagar
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
              <input
                type="number"
                min="0"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-7 pr-4 py-3
                  text-xl font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Puedes ajustar el monto antes de registrar
            </p>
          </div>

          {/* Resumen */}
          <div className="bg-slate-800/50 rounded-lg px-4 py-3 text-sm text-slate-400">
            Se registrará en <span className="text-white font-medium">Costos → Nómina</span>:{' '}
            <span className="text-emerald-400 font-medium">${amount.toLocaleString()}</span>
            {' '}· {periodLabel}
          </div>

          {success && (
            <p className="text-emerald-400 text-sm bg-emerald-500/10 px-3 py-2 rounded-lg text-center">
              ✓ Pago registrado en costos
            </p>
          )}
        </div>

        {/* Acciones */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-400 text-sm
              hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handlePay}
            disabled={success || amount <= 0}
            className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500
              disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            💸 Registrar pago
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────

export const EmployeesPage = () => {
  const { employees, addEmployee, updateEmployee, deactivateEmployee } = useUsers()
  const { user: currentUser } = useAuth()

  const [showForm,        setShowForm]        = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [changingPassword, setChangingPassword] = useState<Employee | null>(null)
  const [payingEmployee,  setPayingEmployee]  = useState<Employee | null>(null)
  const [showInactive,    setShowInactive]    = useState(false)
  const [search,          setSearch]          = useState('')

  const filtered = employees.filter(e => {
    const matchesSearch =
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      e.username.toLowerCase().includes(search.toLowerCase())
    const matchesActive = showInactive ? true : e.isActive
    return matchesSearch && matchesActive
  })

  const handleSave = (data: Omit<Employee, 'id' | 'createdAt'>) => {
    if (editingEmployee) {
      updateEmployee({ ...editingEmployee, ...data })
    } else {
      addEmployee(data)
    }
    setEditingEmployee(null)
    setShowForm(false)
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Empleados</h1>
          <p className="text-slate-500 text-sm">
            {employees.filter(e => e.isActive).length} activos · {employees.length} total
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingEmployee(null) }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500
            text-white text-sm font-medium rounded-lg transition-colors"
        >
          <span>➕</span> Nuevo empleado
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Buscar por nombre o usuario..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white
            placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          onClick={() => setShowInactive(p => !p)}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors
            ${showInactive
              ? 'bg-slate-700 border-slate-600 text-white'
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'}`}
        >
          {showInactive ? 'Ocultando inactivos' : 'Mostrar inactivos'}
        </button>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl py-12 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-slate-500 text-sm">No hay empleados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(employee => {
            const isMe = employee.id === currentUser?.id
            const fullName = `${employee.firstName} ${employee.lastName}`.trim()

            return (
              <div key={employee.id}
                className={`bg-slate-900 border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4
                  ${employee.isActive ? 'border-slate-800' : 'border-slate-800/50 opacity-60'}`}
              >
                {/* Avatar + info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0
                    ${employee.isActive ? 'bg-indigo-600' : 'bg-slate-700'}`}
                  >
                    {employee.firstName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-white">{fullName}</p>
                      {isMe && (
                        <span className="text-xs bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded">
                          Tú
                        </span>
                      )}
                      {!employee.isActive && (
                        <span className="text-xs bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500 mt-0.5">
                      <span>@{employee.username}</span>
                      {employee.phone    && <span>📞 {employee.phone}</span>}
                      {employee.schedule && <span>🕐 {employee.schedule}</span>}
                      <span>💰 ${employee.salary.toLocaleString()}/mes</span>
                    </div>
                  </div>
                </div>

                {/* Role + shift + acciones */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full border font-medium ${ROLE_COLORS[employee.role]}`}>
                    {ROLES.find(r => r.value === employee.role)?.label}
                  </span>
                  <span className="text-xs text-slate-500">
                    {SHIFTS.find(s => s.value === employee.shift)?.label}
                  </span>

                  {/* Acciones */}
                  <div className="flex gap-1 ml-1">
                    {employee.isActive && (
                      <button
                        onClick={() => setPayingEmployee(employee)}
                        title="Registrar pago"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                      >
                        💸
                      </button>
                    )}
                    <button
                      onClick={() => setChangingPassword(employee)}
                      title="Cambiar contraseña"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                    >
                      🔑
                    </button>
                    <button
                      onClick={() => { setEditingEmployee(employee); setShowForm(true) }}
                      title="Editar"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                    >
                      ✏️
                    </button>
                    {/* No puedes desactivarte a ti mismo */}
                    {!isMe && employee.isActive && (
                      <button
                        onClick={() => confirm(`¿Desactivar a ${fullName}?`) && deactivateEmployee(employee.id)}
                        title="Desactivar"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                      >
                        🚫
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modales */}
      {showForm && (
        <EmployeeFormModal
          employee={editingEmployee ?? undefined}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingEmployee(null) }}
        />
      )}
      {changingPassword && (
        <ChangePasswordModal
          employee={changingPassword}
          onClose={() => setChangingPassword(null)}
        />
      )}
      {payingEmployee && (
        <PaySalaryModal
          employee={payingEmployee}
          onClose={() => setPayingEmployee(null)}
        />
      )}
    </div>
  )
}