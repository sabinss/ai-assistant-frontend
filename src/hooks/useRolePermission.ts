import { useMemo } from "react"
import useAuth from "@/store/user"
import { Permission, PERMISSION_MAP, ROLE_PERMISSIONS } from "@/lib/permissions"

/**
 * Centralized hook for role-based permission checks
 * Use this hook to check if a user has permission to view/access specific UI elements
 */
export function useRolePermission() {
  const { role, rolePermission } = useAuth()

  /**
   * Check if user has a specific permission
   * @param permission - The permission to check
   * @returns boolean - true if user has permission, false otherwise
   */
  const hasPermission = useMemo(
    () =>
      (permission: Permission): boolean => {
        // Admin has full access to everything
        if (role === "admin") {
          return true
        }

        // Check role-based permissions first
        if (role && ROLE_PERMISSIONS[role]) {
          if (ROLE_PERMISSIONS[role].includes(permission)) {
            return true
          }
        }

        // Check permission-based access
        const requiredPermissions = PERMISSION_MAP[permission]
        if (!requiredPermissions || requiredPermissions.length === 0) {
          return false
        }

        // User has permission if they have any of the required permissions
        return requiredPermissions.some((reqPerm) => rolePermission.includes(reqPerm))
      },
    [role, rolePermission]
  )

  /**
   * Check if user has any of the specified permissions
   * @param permissions - Array of permissions to check
   * @returns boolean - true if user has at least one permission
   */
  const hasAnyPermission = useMemo(
    () =>
      (permissions: Permission[]): boolean => {
        return permissions.some((perm) => hasPermission(perm))
      },
    [hasPermission]
  )

  /**
   * Check if user has all of the specified permissions
   * @param permissions - Array of permissions to check
   * @returns boolean - true if user has all permissions
   */
  const hasAllPermissions = useMemo(
    () =>
      (permissions: Permission[]): boolean => {
        return permissions.every((perm) => hasPermission(perm))
      },
    [hasPermission]
  )

  /**
   * Check if user has a specific role
   * @param roleToCheck - The role to check
   * @returns boolean - true if user has the role
   */
  const hasRole = useMemo(
    () =>
      (roleToCheck: string): boolean => {
        return role === roleToCheck
      },
    [role]
  )

  /**
   * Check if user has any of the specified roles
   * @param rolesToCheck - Array of roles to check
   * @returns boolean - true if user has at least one role
   */
  const hasAnyRole = useMemo(
    () =>
      (rolesToCheck: string[]): boolean => {
        return role !== null && rolesToCheck.includes(role)
      },
    [role]
  )

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    role,
    rolePermission,
  }
}
