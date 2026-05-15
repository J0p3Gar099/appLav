/**
 * HOOKS / usePermissions.ts
 * Actualizado con los nuevos permisos de los 3 roles.
 */
import { useMemo } from 'react'
import { ROLE_PERMISSIONS, type RolePermissions } from '@/models/user.model'
import { useAuth } from '@/context/AuthContext'

interface UsePermissionsReturn extends RolePermissions {
  isAdmin:      boolean
  isConsultor:  boolean
  isUser:       boolean
  hasPermission: (permission: keyof RolePermissions) => boolean
}

export function usePermissions(): UsePermissionsReturn {
  const { user } = useAuth()

  return useMemo(() => {
    if (!user) {
      const none = Object.fromEntries(
        Object.keys(ROLE_PERMISSIONS.user).map(k => [k, false])
      ) as unknown as RolePermissions

      return {
        ...none,
        isAdmin:      false,
        isConsultor:  false,
        isUser:       false,
        hasPermission: () => false,
      }
    }

    const permissions = ROLE_PERMISSIONS[user.role]

    return {
      ...permissions,
      isAdmin:      user.role === 'admin',
      isConsultor:  user.role === 'consultor',
      isUser:       user.role === 'user',
      hasPermission: (p: keyof RolePermissions) => permissions[p],
    }
  }, [user])
}