"use client"

import { ReactNode } from "react"
import { useRolePermission } from "@/hooks/useRolePermission"
import { Permission } from "@/lib/permissions"

interface RoleGuardProps {
  children: ReactNode
  /**
   * Permission required to render children
   * If provided, children will only render if user has this permission
   */
  permission?: Permission
  /**
   * Array of permissions - user needs at least one
   */
  anyPermission?: Permission[]
  /**
   * Array of permissions - user needs all of them
   */
  allPermissions?: Permission[]
  /**
   * Role required to render children
   * If provided, children will only render if user has this role
   */
  role?: string
  /**
   * Array of roles - user needs at least one
   */
  anyRole?: string[]
  /**
   * Invert the check - render children if condition is false
   */
  invert?: boolean
  /**
   * Fallback component to render when condition is not met
   */
  fallback?: ReactNode
}

/**
 * RoleGuard component - Conditionally renders children based on user role/permissions
 *
 * @example
 * // Show button only if user has ADD_USER permission
 * <RoleGuard permission={Permission.ADD_USER}>
 *   <button>Add User</button>
 * </RoleGuard>
 *
 * @example
 * // Show content if user has any of the specified permissions
 * <RoleGuard anyPermission={[Permission.ADD_USER, Permission.EDIT_USER]}>
 *   <div>Admin Content</div>
 * </RoleGuard>
 *
 * @example
 * // Hide content for individual role
 * <RoleGuard role="individual" invert>
 *   <div>Not for individuals</div>
 * </RoleGuard>
 */
export function RoleGuard({
  children,
  permission,
  anyPermission,
  allPermissions,
  role,
  anyRole,
  invert = false,
  fallback = null,
}: RoleGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole } =
    useRolePermission()

  let shouldRender = false

  // Check permissions
  if (permission !== undefined) {
    shouldRender = hasPermission(permission)
  } else if (anyPermission && anyPermission.length > 0) {
    shouldRender = hasAnyPermission(anyPermission)
  } else if (allPermissions && allPermissions.length > 0) {
    shouldRender = hasAllPermissions(allPermissions)
  }
  // Check roles
  else if (role !== undefined) {
    shouldRender = hasRole(role)
  } else if (anyRole && anyRole.length > 0) {
    shouldRender = hasAnyRole(anyRole)
  } else {
    // If no condition specified, render by default
    shouldRender = true
  }

  // Apply invert if specified
  if (invert) {
    shouldRender = !shouldRender
  }

  if (shouldRender) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
