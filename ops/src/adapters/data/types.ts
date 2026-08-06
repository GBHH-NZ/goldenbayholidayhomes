import type { TenantCollection, TenantData, WriteMethod } from '@/types';

export type DataListener = (data: TenantData) => void;
export type ConnectionListener = (connected: boolean) => void;

export interface DataAdapter {
  readonly mode: 'mock' | 'firebase';
  /** Load initial tenant snapshot (seed or remote). */
  loadTenant(tenantId: string): Promise<TenantData>;
  /** Subscribe to live updates; returns unsubscribe. */
  subscribe(tenantId: string, listener: DataListener): () => void;
  subscribeConnection?(listener: ConnectionListener): () => void;
  write(path: string, data: unknown, method?: WriteMethod): Promise<void>;
  isConnected(): boolean;
}

export const EMPTY_TENANT_DATA = (): TenantData => ({
  properties: [],
  workLogs: [],
  scheduledTasks: [],
  taskTemplates: [],
  employees: [],
  visits: [],
  taskGroups: [],
  checklists: [],
  deletedTasks: {},
});

export const TENANT_COLLECTIONS: TenantCollection[] = [
  'properties',
  'workLogs',
  'scheduledTasks',
  'taskTemplates',
  'employees',
  'visits',
  'taskGroups',
  'checklists',
  'deletedTasks',
];
