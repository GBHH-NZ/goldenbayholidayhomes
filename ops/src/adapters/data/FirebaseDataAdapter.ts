import type { DataAdapter, DataListener } from './types';
import type { TenantData, WriteMethod } from '@/types';
import { EMPTY_TENANT_DATA } from './types';

/**
 * Stub for Firebase Realtime Database. Selected when VITE_DATA_BACKEND=firebase.
 */
export class FirebaseDataAdapter implements DataAdapter {
  readonly mode = 'firebase' as const;

  async loadTenant(_tenantId: string): Promise<TenantData> {
    this.assertConfigured();
    return EMPTY_TENANT_DATA();
  }

  subscribe(_tenantId: string, _listener: DataListener): () => void {
    this.assertConfigured();
    return () => undefined;
  }

  isConnected(): boolean {
    return false;
  }

  async write(_path: string, _data: unknown, _method: WriteMethod = 'set'): Promise<void> {
    this.assertConfigured();
  }

  private assertConfigured(): never {
    const env = import.meta.env;
    const missing = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_DATABASE_URL',
      'VITE_FIREBASE_PROJECT_ID',
    ].filter((k) => !env[k as keyof typeof env]);

    throw new Error(
      `Firebase Data is not configured. Missing: ${missing.join(', ') || 'implementation'}. ` +
        'Use VITE_DATA_BACKEND=mock until Firebase secrets are set.'
    );
  }
}
