/**
 * CONFIG / auth.config.ts
 *
 * Centraliza todas las constantes relacionadas con autenticación.
 *
 * ¿Por qué una carpeta config/ separada?
 * Porque los "magic strings" y "magic numbers" dispersos por el código
 * son una fuente de bugs difíciles de rastrear. Si mañana cambia la
 * clave de localStorage de 'auth_token' a 'jwt', lo cambias aquí
 * y TypeScript te ayuda a encontrar cualquier uso que hayas olvidado.
 *
 * También hace la transición a variables de entorno (.env) trivial:
 * en lugar de buscar strings por todo el proyecto, solo actualizas este archivo.
 */

export const AUTH_CONFIG = {
  // Claves de localStorage — único lugar donde se definen estos strings
  STORAGE_KEYS: {
    TOKEN: 'auth_token',
    USER:  'auth_user',
  },

  // Rutas de la aplicación — evita strings duplicados en componentes
  ROUTES: {
    LOGIN:     '/login',
    ORDER:    '/orders',
     EMPLOYEES: '/employees',
    DASHBOARD: '/dashboard',
    HOME:      '/',
    USERS:     '/dashboard/users',
    REPORTS:   '/dashboard/reports',
    SETTINGS:  '/dashboard/settings',
    FORBIDDEN: '/403',
  },

  /**
   * Usuarios hardcodeados — SOLO para desarrollo/demo.
   *
   * En producción esto NO existe. El servicio de auth haría
   * fetch() a un endpoint real. Este array se elimina y el
   * servicio llama a la API. El resto del código NO cambia.
   *
   * ¿Por qué ponerlos en config y no en el servicio directamente?
   * Porque son "datos de configuración", no lógica. El servicio
   * se ocupa del comportamiento, no de los datos.
   */
  MOCK_USERS: [
    {
      id:          '1',
      username:    'admin',
      password:    '1234',       // ⚠️ solo en mock, nunca en producción
      email:       'admin@app.com',
      role:        'admin' as const,
      displayName: 'Administrador',
    },
    {
      id:          '2',
      username:    'user',
      password:    '1234',
      email:       'user@app.com',
      role:        'user' as const,
      displayName: 'Usuario Normal',
    },
  ],

  // Simula el delay de una llamada a API real (ms)
  MOCK_DELAY_MS: 800,
} as const
// "as const": hace que todos los valores sean readonly y tipados literalmente.
// Ejemplo: ROUTES.LOGIN es de tipo '/login', no string.
// Esto permite usar los valores como tipos en otras partes del código.
