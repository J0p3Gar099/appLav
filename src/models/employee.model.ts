/**
 * MODELS / employee.model.ts
 *
 * Extiende al User con datos administrativos del empleado.
 * Employee = User (para login) + datos laborales (para la app).
 *
 * Separamos los tipos porque:
 * - User: lo que necesita el sistema de auth (id, username, role)
 * - Employee: lo que necesita RRHH (turno, paga, dirección, etc.)
 */
import type { UserRole } from './user.model'

export type Shift = 'MAÑANA' | 'TARDE' | 'NOCHE'

export interface Employee {
  // ── Auth (estos campos habilitan el login) ──
  id: string
  username: string
  password: string        // en producción esto sería un hash, nunca plaintext
  role: UserRole

  // ── Datos personales ──
  firstName: string
  lastName: string
  phone?: string
  address?: string
  birthDate?: string      // ISO date: "1990-05-15"
  email?: string

  // ── Datos laborales ──
  shift: Shift
  schedule: string        // ej: "Lun-Vie 08:00-16:00"
  startDate: string       // fecha de ingreso ISO
  salary: number          // solo admin lo ve (controlado en la página)
  isActive: boolean       // desactivar sin borrar

  createdAt: string
}