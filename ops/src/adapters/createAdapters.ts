import type { AuthAdapter } from './auth/types';
import type { DataAdapter } from './data/types';
import { MockAuthAdapter } from './auth/MockAuthAdapter';
import { FirebaseAuthAdapter } from './auth/FirebaseAuthAdapter';
import { MockDataAdapter } from './data/MockDataAdapter';
import { FirebaseDataAdapter } from './data/FirebaseDataAdapter';
import type { User } from '@/types';

export interface Adapters {
  auth: AuthAdapter;
  data: DataAdapter;
}

let singleton: Adapters | null = null;

export function getBackendMode(): 'mock' | 'firebase' {
  return import.meta.env.VITE_DATA_BACKEND === 'firebase' ? 'firebase' : 'mock';
}

export function createAdapters(): Adapters {
  if (singleton) return singleton;

  const mode = getBackendMode();

  if (mode === 'firebase') {
    singleton = {
      auth: new FirebaseAuthAdapter(),
      data: new FirebaseDataAdapter(),
    };
    return singleton;
  }

  const data = new MockDataAdapter();
  const auth = new MockAuthAdapter();

  auth.setEmployeeLookup(async (username) => {
    const employees = data.getEmployeesSnapshot('demo');
    const employee = employees.find(
      (e) => e.username?.toLowerCase() === username.toLowerCase() && e.active !== false
    );
    if (!employee) return null;

    const user: User = {
      username: employee.username,
      role: employee.role || 'employee',
      tenantId: employee.tenantId || 'demo',
      employeeId: employee.id,
      createdAt: employee.createdAt,
    };

    return {
      user,
      passwordOk: (pw: string) =>
        Boolean(
          (employee.tempPassword && employee.tempPassword === pw) ||
            (username.toLowerCase() === 'test' && pw === 'test')
        ),
    };
  });

  singleton = { auth, data };
  return singleton;
}

export function getAdapters(): Adapters {
  return createAdapters();
}
