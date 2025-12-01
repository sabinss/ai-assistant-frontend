/**
 * Centralized permission definitions
 * Define all UI permissions and their associated roles/permissions here
 */

export enum Permission {
  // User Management
  ADD_USER = "add_user",
  EDIT_USER = "edit_user",
  DELETE_USER = "delete_user",
  VIEW_USERS = "view_users",

  // Add more permissions as needed
  VIEW_DASHBOARD = "view_dashboard",
  VIEW_CHAT = "view_chat",
  VIEW_FEEDBACKS = "view_feedbacks",
  UPLOAD_DOCUMENTS = "upload_documents",
  VIEW_SETTINGS = "view_settings",
  VIEW_CONFIGURATION = "view_configuration",
  VIEW_ORGANIZATION = "view_organization",
  VIEW_NOTIFICATIONS = "view_notifications",
}

/**
 * Map permissions to role permissions (from rolePermission array)
 * This maps UI permissions to backend permission strings
 */
export const PERMISSION_MAP: Record<Permission, string[]> = {
  [Permission.ADD_USER]: ["admin"], // Users with "users" permission can add users
  [Permission.EDIT_USER]: ["admin"],
  [Permission.DELETE_USER]: ["admin"],
  [Permission.VIEW_USERS]: ["users"],

  [Permission.VIEW_DASHBOARD]: ["dashboard"],
  [Permission.VIEW_CHAT]: ["chat"],
  [Permission.VIEW_FEEDBACKS]: ["feedbacks"],
  [Permission.UPLOAD_DOCUMENTS]: ["source"],
  [Permission.VIEW_SETTINGS]: ["settings"],
  [Permission.VIEW_CONFIGURATION]: ["configuration"],
  [Permission.VIEW_ORGANIZATION]: ["organization"],
  [Permission.VIEW_NOTIFICATIONS]: ["notification"],
}

/**
 * Roles that have access to specific permissions
 * Use this for role-based checks (e.g., "individual" role restrictions)
 */
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  // Admin has full access to all permissions
  admin: [
    Permission.ADD_USER,
    Permission.EDIT_USER,
    Permission.DELETE_USER,
    Permission.VIEW_USERS,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_CHAT,
    Permission.VIEW_FEEDBACKS,
    Permission.UPLOAD_DOCUMENTS,
    Permission.VIEW_SETTINGS,
    Permission.VIEW_CONFIGURATION,
    Permission.VIEW_ORGANIZATION,
    Permission.VIEW_NOTIFICATIONS,
  ],
  // Individual and user roles have no permissions (UI will be hidden)
  individual: [],
  user: [],
}
