import type { AuthAdapter, LoginResult } from './types';
import type { User } from '@/types';

/**
 * Stub for Firebase Auth (+ future 2FA). Selected when VITE_DATA_BACKEND=firebase
 * but refuses to run until Firebase env vars are configured.
 */
export class FirebaseAuthAdapter implements AuthAdapter {
  readonly mode = 'firebase' as const;

  restoreSession(): User | null {
    this.assertConfigured();
    return null;
  }

  async login(_username: string, _password: string): Promise<LoginResult> {
    this.assertConfigured();
    return { success: false, message: 'Firebase Auth not implemented yet' };
  }

  logout(): void {
    this.assertConfigured();
  }

  private assertConfigured(): never {
    const env = import.meta.env;
    const missing = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_DATABASE_URL',
      'VITE_FIREBASE_PROJECT_ID',
    ].filter((k) => !env[k as keyof typeof env]);

    throw new Error(
      `Firebase Auth is not configured. Missing: ${missing.join(', ') || 'implementation'}. ` +
        'Use VITE_DATA_BACKEND=mock until Firebase secrets are set.'
    );
  }
}
