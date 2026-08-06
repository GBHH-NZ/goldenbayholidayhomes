import type { User } from '@/types';

export interface LoginResult {
  success: boolean;
  message: string;
  user?: User;
}

export interface AuthAdapter {
  readonly mode: 'mock' | 'firebase';
  restoreSession(): User | null;
  login(username: string, password: string): Promise<LoginResult>;
  logout(): void;
  /** Optional employee lookup for mock/firebase team logins */
  setEmployeeLookup?(lookup: (username: string) => Promise<{ user: User; passwordOk: (pw: string) => boolean } | null>): void;
}
