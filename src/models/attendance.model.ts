/**
 * MODELS / attendance.model.ts
 *
 * Registro de sesiones (login / logout) de los empleados.
 */

export interface AttendanceEntry {
  id: string
  userId: string
  userName: string
  userRole: string
  loginAt: string   // ISO
  logoutAt?: string // ISO — undefined si aún está activo
}
