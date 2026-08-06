import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User } from '@/types';
import { getAdapters } from '@/adapters/createAdapters';
import { readStoredIsAdmin } from '@/adapters/auth/MockAuthAdapter';
import { isAdminRole } from '@/services/permissions';
import { clearTenantCache } from '@/services/offlineCache';

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  isMockMode: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { auth } = getAdapters();

  useEffect(() => {
    try {
      const restored = auth.restoreSession();
      if (restored) {
        setUser(restored);
        setIsAdmin(isAdminRole(restored.role) || readStoredIsAdmin());
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  }, [auth]);

  const login = useCallback(
    async (username: string, password: string) => {
      const result = await auth.login(username, password);
      if (result.success && result.user) {
        setUser(result.user);
        setIsAdmin(isAdminRole(result.user.role));
      }
      return { success: result.success, message: result.message };
    },
    [auth]
  );

  const logout = useCallback(() => {
    const tenantId = user?.tenantId;
    auth.logout();
    setUser(null);
    setIsAdmin(false);
    if (tenantId) void clearTenantCache(tenantId);
  }, [auth, user?.tenantId]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        isMockMode: auth.mode === 'mock',
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
