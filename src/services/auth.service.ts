/**
 * SERVICES / auth.service.ts
 *
 * Ahora lee usuarios desde UserContext en lugar del array hardcodeado.
 *
 * El problema: authService es un objeto plano, no un componente React,
 * así que no puede llamar a useUsers() directamente.
 *
 * Solución: inyección de dependencias. AuthContext le pasa la función
 * findByCredentials cuando llama a login(). El servicio no sabe de dónde
 * vienen los usuarios, solo recibe la función y la usa.
 *
 * Esto mantiene el servicio desacoplado del contexto y facilita testing.
 */
import { AUTH_CONFIG } from '@/config/auth.config'
import type { AuthResponse, LoginCredentials, User } from '@/models/user.model'
import type { Employee } from '@/models/employee.model'
import { storageGet, storageRemove, storageSet } from '@/utils/storage.utils'

type ServiceResult<T> =
  | { success: true;  data: T }
  | { success: false; error: string }

const simulateDelay = (): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, AUTH_CONFIG.MOCK_DELAY_MS))

const generateMockToken = (userId: string): string => {
  const payload = btoa(JSON.stringify({ sub: userId, iat: Date.now() }))
  return `mock.${payload}.signature`
}

/** Convierte un Employee en el User que usa el sistema de auth */
const employeeToUser = (employee: Employee): User => ({
  id:          employee.id,
  username:    employee.username,
  email:       employee.email ?? '',
  role:        employee.role,
  displayName: `${employee.firstName} ${employee.lastName}`.trim(),
})

export const authService = {
  /**
   * login — ahora recibe findByCredentials como parámetro.
   * AuthContext se lo pasa al llamar a este método.
   */
  async login(
    credentials: LoginCredentials,
    findByCredentials: (username: string, password: string) => Employee | undefined,
  ): Promise<ServiceResult<AuthResponse>> {
    await simulateDelay()

    const employee = findByCredentials(credentials.username, credentials.password)

    if (!employee) {
      return { success: false, error: 'Usuario o contraseña incorrectos' }
    }

    const user = employeeToUser(employee)
    const token = generateMockToken(user.id)

    return { success: true, data: { user, token } }
  },

  async logout(): Promise<void> {
    await simulateDelay()
    storageRemove(AUTH_CONFIG.STORAGE_KEYS.TOKEN)
    storageRemove(AUTH_CONFIG.STORAGE_KEYS.USER)
  },

  getStoredSession(): { user: User; token: string } | null {
    const token = storageGet<string>(AUTH_CONFIG.STORAGE_KEYS.TOKEN)
    const user  = storageGet<User>(AUTH_CONFIG.STORAGE_KEYS.USER)
    if (!token || !user) return null
    return { token, user }
  },

  persistSession(user: User, token: string): void {
    storageSet(AUTH_CONFIG.STORAGE_KEYS.TOKEN, token)
    storageSet(AUTH_CONFIG.STORAGE_KEYS.USER, user)
  },
}