import type { UserRole } from '@/types';

const PERMISSIONS: Record<string, UserRole[]> = {
  PROPERTY_VIEW: ['master_admin', 'admin', 'demo_admin', 'employee'],
  PROPERTY_CREATE: ['master_admin', 'admin', 'demo_admin', 'employee'],
  PROPERTY_UPDATE: ['master_admin', 'admin', 'demo_admin', 'employee'],
  PROPERTY_DELETE: ['master_admin', 'admin'],
  LOG_VIEW: ['master_admin', 'admin', 'demo_admin', 'employee'],
  LOG_CREATE: ['master_admin', 'admin', 'demo_admin', 'employee'],
  LOG_UPDATE: ['master_admin', 'admin', 'demo_admin', 'employee'],
  LOG_DELETE: ['master_admin', 'admin'],
  TASK_VIEW: ['master_admin', 'admin', 'demo_admin', 'employee'],
  TASK_SCHEDULE: ['master_admin', 'admin', 'demo_admin', 'employee'],
  TASK_COMPLETE: ['master_admin', 'admin', 'demo_admin', 'employee'],
  TASK_DELETE: ['master_admin', 'admin'],
  EMPLOYEE_VIEW: ['master_admin', 'admin'],
  EMPLOYEE_CREATE: ['master_admin', 'admin'],
  EMPLOYEE_DELETE: ['master_admin', 'admin'],
  REPORT_VIEW: ['master_admin', 'admin', 'demo_admin', 'employee'],
  TASK_TEMPLATE_MANAGE: ['master_admin', 'admin'],
  CHECKLIST_MANAGE: ['master_admin', 'admin', 'demo_admin', 'employee'],
};

export function hasPermission(role: UserRole | undefined, permission: string): boolean {
  if (!role) return false;
  const allowed = PERMISSIONS[permission];
  return allowed ? allowed.includes(role) : false;
}

export function isAdminRole(role: UserRole | undefined): boolean {
  return role === 'master_admin' || role === 'admin';
}

export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    master_admin: 'Manager',
    admin: 'Manager',
    demo_admin: 'Manager',
    employee: 'Staff',
  };
  return names[role] || role;
}

export function staffLabel(displayName?: string, jobType?: string, username?: string): string {
  const name = displayName || username || 'Staff';
  if (!jobType || jobType === 'other') return name;
  const job =
    jobType === 'cleaner'
      ? 'Cleaner'
      : jobType === 'maintenance'
        ? 'Maintenance'
        : jobType === 'manager'
          ? 'Manager'
          : jobType;
  return `${name} · ${job}`;
}

export const APP_VERSION = '0.1.0';
