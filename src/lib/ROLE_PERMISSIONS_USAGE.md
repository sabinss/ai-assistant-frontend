# Role-Based UI Visibility System

This document explains how to use the centralized role-based UI visibility system.

## Overview

The system provides a centralized way to control UI element visibility based on user roles and permissions. It consists of:

1. **Permission Constants** (`src/lib/permissions.ts`) - Defines all available permissions
2. **useRolePermission Hook** (`src/hooks/useRolePermission.ts`) - Hook for checking permissions
3. **RoleGuard Component** (`src/components/shared/RoleGuard.tsx`) - Component for conditional rendering

## Usage Examples

### 1. Using RoleGuard Component (Recommended)

The `RoleGuard` component is the easiest way to conditionally show/hide UI elements.

#### Basic Permission Check

```tsx
import { RoleGuard } from "@/components/shared/RoleGuard"
import { Permission } from "@/lib/permissions"

// Show button only if user has ADD_USER permission
;<RoleGuard permission={Permission.ADD_USER}>
  <button>Add User</button>
</RoleGuard>
```

#### Multiple Permissions (Any)

```tsx
// Show content if user has ANY of these permissions
<RoleGuard anyPermission={[Permission.ADD_USER, Permission.EDIT_USER]}>
  <div>Admin Content</div>
</RoleGuard>
```

#### Multiple Permissions (All)

```tsx
// Show content only if user has ALL of these permissions
<RoleGuard allPermissions={[Permission.ADD_USER, Permission.EDIT_USER]}>
  <div>Super Admin Content</div>
</RoleGuard>
```

#### Role-Based Check

```tsx
// Show content only for specific role
<RoleGuard role="admin">
  <div>Admin Only</div>
</RoleGuard>

// Show content for multiple roles
<RoleGuard anyRole={["admin", "manager"]}>
  <div>Admin or Manager</div>
</RoleGuard>
```

#### Invert Check

```tsx
// Hide content for specific role
<RoleGuard role="individual" invert>
  <div>Not for individuals</div>
</RoleGuard>
```

#### With Fallback

```tsx
<RoleGuard
  permission={Permission.ADD_USER}
  fallback={<p>You don't have permission to add users</p>}
>
  <button>Add User</button>
</RoleGuard>
```

### 2. Using useRolePermission Hook

For more complex logic, use the hook directly:

```tsx
import { useRolePermission } from "@/hooks/useRolePermission"
import { Permission } from "@/lib/permissions"

function MyComponent() {
  const { hasPermission, hasRole, hasAnyPermission } = useRolePermission()

  if (hasPermission(Permission.ADD_USER)) {
    return <button>Add User</button>
  }

  if (hasRole("admin")) {
    return <div>Admin Dashboard</div>
  }

  if (hasAnyPermission([Permission.EDIT_USER, Permission.DELETE_USER])) {
    return <div>Can manage users</div>
  }

  return null
}
```

## Adding New Permissions

1. Add the permission to the `Permission` enum in `src/lib/permissions.ts`:

```typescript
export enum Permission {
  // ... existing permissions
  NEW_FEATURE = "new_feature",
}
```

2. Map it to role permissions:

```typescript
export const PERMISSION_MAP: Record<Permission, string[]> = {
  // ... existing mappings
  [Permission.NEW_FEATURE]: ["new_feature_permission"],
}
```

3. Use it in your components:

```tsx
<RoleGuard permission={Permission.NEW_FEATURE}>
  <NewFeatureComponent />
</RoleGuard>
```

## Best Practices

1. **Use RoleGuard for simple show/hide logic** - It's cleaner and more readable
2. **Use the hook for complex conditional logic** - When you need multiple checks or custom logic
3. **Define permissions centrally** - Always add new permissions to `permissions.ts`
4. **Use descriptive permission names** - Makes code more maintainable
5. **Test with different roles** - Ensure permissions work as expected

## Current Implementation

The "Add User" button in `UserTable.tsx` now uses this system:

```tsx
<RoleGuard permission={Permission.ADD_USER}>
  <button>Add Users</button>
</RoleGuard>
```

The button will only show if the user has the "users" permission in their `rolePermission` array.
