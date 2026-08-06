import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type { TenantData, TenantCollection } from '@/types';
import { EMPTY_TENANT_DATA, TENANT_COLLECTIONS } from '@/adapters/data/types';
import { getAdapters } from '@/adapters/createAdapters';
import { saveToCache, loadAllTenantData } from '@/services/offlineCache';
import { syncManager } from '@/services/syncManager';
import { useAuth } from './AuthContext';

interface TenantDataContextValue {
  data: TenantData;
  setData: Dispatch<SetStateAction<TenantData>>;
  isLoading: boolean;
  isStale: boolean;
  refreshFromCache: () => Promise<void>;
}

const TenantDataContext = createContext<TenantDataContextValue | null>(null);

export function TenantDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState<TenantData>(EMPTY_TENANT_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const { data: adapter } = getAdapters();

  const refreshFromCache = useCallback(async () => {
    if (!user?.tenantId) return;
    const cached = await loadAllTenantData(user.tenantId);
    setData((prev) => ({ ...prev, ...cached }) as TenantData);
  }, [user?.tenantId]);

  useEffect(() => {
    if (!user?.tenantId) {
      setData(EMPTY_TENANT_DATA());
      return;
    }

    const tenantId = user.tenantId;
    let mounted = true;
    const unsubscribers: (() => void)[] = [];

    async function init() {
      setIsLoading(true);

      const cached = await loadAllTenantData(tenantId);
      if (mounted && Object.keys(cached).length > 0) {
        setData({ ...EMPTY_TENANT_DATA(), ...cached } as TenantData);
        setIsStale(!navigator.onLine);
        syncManager.setStaleData(!navigator.onLine);
      }

      if (adapter.subscribeConnection) {
        unsubscribers.push(
          adapter.subscribeConnection((connected) => {
            syncManager.onConnectionChange(connected);
            if (connected) {
              setIsStale(false);
              syncManager.setStaleData(false);
            }
          })
        );
      }

      unsubscribers.push(
        adapter.subscribe(tenantId, async (next) => {
          if (!mounted) return;
          setData(next);
          await Promise.all(
            TENANT_COLLECTIONS.map((col) =>
              saveToCache(tenantId, col as TenantCollection, next[col as keyof TenantData])
            )
          );
        })
      );

      if (mounted) setIsLoading(false);
    }

    void init();

    return () => {
      mounted = false;
      unsubscribers.forEach((u) => u());
    };
  }, [user?.tenantId, adapter]);

  return (
    <TenantDataContext.Provider value={{ data, setData, isLoading, isStale, refreshFromCache }}>
      {children}
    </TenantDataContext.Provider>
  );
}

export function useTenantData() {
  const ctx = useContext(TenantDataContext);
  if (!ctx) throw new Error('useTenantData must be used within TenantDataProvider');
  return ctx;
}
