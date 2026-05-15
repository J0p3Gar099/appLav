/**
 * UTILS / storage.utils.ts
 *
 * Abstracción sobre localStorage.
 *
 * ¿Por qué no usar localStorage directamente en los servicios?
 *
 * 1. localStorage puede lanzar excepciones:
 *    - En modo incógnito de Safari (QuotaExceededError)
 *    - Si el storage está lleno
 *    - En SSR (no existe window)
 *    Aquí capturamos esos errores en un solo lugar.
 *
 * 2. Facilita el testing: en tests puedes mockear este módulo
 *    en lugar de mockear localStorage directamente.
 *
 * 3. Si el día de mañana migramos a sessionStorage o a un
 *    sistema de cookies httpOnly, solo cambiamos este archivo.
 */

/**
 * Guarda un valor en localStorage serializado como JSON.
 * Silencia errores (storage lleno, incógnito, SSR).
 */
export function storageSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`[storage] No se pudo guardar "${key}":`, error)
  }
}

/**
 * Lee y deserializa un valor de localStorage.
 * Devuelve null si no existe o si el JSON está corrupto.
 *
 * El tipo genérico T le dice a TypeScript qué forma tiene el valor.
 * Uso: storageGet<User>('auth_user')
 *
 * Nota: el "as T" es un type assertion. Confiamos en que lo que
 * guardamos tiene la forma correcta. En producción podrías añadir
 * una función de validación (zod, yup) para verificarlo.
 */
export function storageGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/**
 * Elimina un item del localStorage.
 */
export function storageRemove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn(`[storage] No se pudo eliminar "${key}":`, error)
  }
}
