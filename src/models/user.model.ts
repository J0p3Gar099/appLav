/**
 * MODELS / user.model.ts
 * Agregamos el rol 'consultor' al sistema.
 */
export type UserRole = 'admin' | 'consultor' | 'user'

export interface User {
  id: string
  username: string
  email: string
  role: UserRole
  displayName: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface RolePermissions {
  canViewDashboardFinancials: boolean  // ingresos, utilidad, costos
  canViewCosts: boolean
  canViewEmployees: boolean
  canManageAllOrders: boolean          // editar/borrar pedidos ajenos
  canViewOrderPrices: boolean
  canViewEmployeeSalary: boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canViewDashboardFinancials: true,
    canViewCosts:               true,
    canViewEmployees:           true,
    canManageAllOrders:         true,
    canViewOrderPrices:         true,
    canViewEmployeeSalary:      true,
  },
  consultor: {
    canViewDashboardFinancials: true,
    canViewCosts:               false,
    canViewEmployees:           false,
    canManageAllOrders:         false,
    canViewOrderPrices:         true,
    canViewEmployeeSalary:      false,
  },
  user: {
    canViewDashboardFinancials: false,
    canViewCosts:               false,
    canViewEmployees:           false,
    canManageAllOrders:         false,
    canViewOrderPrices:         true,
    canViewEmployeeSalary:      false,
  },
}