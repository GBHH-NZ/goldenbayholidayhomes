import type { AuthAdapter, LoginResult } from './types';
import type { User } from '@/types';
import { isAdminRole } from '@/services/permissions';

const SESSION_KEY = 'gbhh_ops_user';
const ADMIN_KEY = 'gbhh_ops_isAdmin';
const TENANT_KEY = 'gbhh_ops_tenantId';

const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

function checkRateLimit(username: string): { allowed: boolean; message: string } {
  const record = loginAttempts.get(username.toLowerCase());
  if (record && Date.now() < record.lockedUntil) {
    const mins = Math.ceil((record.lockedUntil - Date.now()) / 60000);
    return { allowed: false, message: `Too many attempts. Try again in ${mins} minutes.` };
  }
  return { allowed: true, message: '' };
}

function recordAttempt(username: string, success: boolean) {
  const key = username.toLowerCase();
  if (success) {
    loginAttempts.delete(key);
    return;
  }
  const record = loginAttempts.get(key) || { count: 0, lockedUntil: 0 };
  record.count++;
  if (record.count >= 5) {
    record.lockedUntil = Date.now() + 15 * 60 * 1000;
    record.count = 0;
  }
  loginAttempts.set(key, record);
}

type EmployeeLookup = (
  username: string
) => Promise<{ user: User; passwordOk: (pw: string) => boolean } | null>;

/**
 * Mock auth: username `test` / password `test` → admin on tenant `demo`.
 * Also accepts seeded employee credentials via setEmployeeLookup.
 */
export class MockAuthAdapter implements AuthAdapter {
  readonly mode = 'mock' as const;
  private employeeLookup: EmployeeLookup | null = null;

  setEmployeeLookup(lookup: EmployeeLookup) {
    this.employeeLookup = lookup;
  }

  restoreSession(): User | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as User;
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  async login(username: string, password: string): Promise<LoginResult> {
    const rateCheck = checkRateLimit(username);
    if (!rateCheck.allowed) return { success: false, message: rateCheck.message };

    const trimmed = username.trim();
    if (!trimmed || !password) {
      return { success: false, message: 'Please enter both username and password' };
    }

    if (trimmed.toLowerCase() === 'test' && password === 'test') {
      recordAttempt(trimmed, true);
      const user: User = {
        username: 'test',
        role: 'admin',
        tenantId: 'demo',
        createdAt: new Date().toISOString(),
      };
      this.persist(user);
      return { success: true, message: 'Welcome test!', user };
    }

    if (this.employeeLookup) {
      const found = await this.employeeLookup(trimmed);
      if (found && found.passwordOk(password)) {
        recordAttempt(trimmed, true);
        this.persist(found.user);
        return { success: true, message: `Welcome ${found.user.username}!`, user: found.user };
      }
    }

    recordAttempt(trimmed, false);
    return { success: false, message: 'Invalid username or password' };
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(ADMIN_KEY);
    sessionStorage.removeItem(TENANT_KEY);
  }

  private persist(user: User) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    sessionStorage.setItem(ADMIN_KEY, String(isAdminRole(user.role)));
    sessionStorage.setItem(TENANT_KEY, user.tenantId);
  }
}

export function readStoredIsAdmin(): boolean {
  return sessionStorage.getItem(ADMIN_KEY) === 'true';
}
