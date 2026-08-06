import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, isAdminRole } from '@/services/permissions';

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role;

  return {
    can: (permission: string) => hasPermission(role, permission),
    canManageEmployees: () => hasPermission(role, 'EMPLOYEE_VIEW'),
    canManageTasks: () => hasPermission(role, 'TASK_TEMPLATE_MANAGE'),
    canDelete: () => isAdminRole(role),
    isAdmin: () => isAdminRole(role),
  };
}
