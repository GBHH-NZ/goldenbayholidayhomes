export type UserRole = 'master_admin' | 'admin' | 'demo_admin' | 'employee';

export type CleaningTier = 'standard' | 'deep' | 'premium';

export type JobType = 'cleaner' | 'maintenance' | 'manager' | 'other';

export interface User {
  username: string;
  role: UserRole;
  tenantId: string;
  employeeId?: string;
  createdAt?: string;
}

export interface Property {
  id: string;
  name: string;
  address?: string;
  town?: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  petsAllowed?: boolean;
  cleaningTier?: CleaningTier;
  approximateSqm?: number;
  hasHotTub?: boolean;
  hasPool?: boolean;
  hasGarden?: boolean;
  linenIncluded?: boolean;
  status?: string;
  archived?: boolean;
  notes?: string;
  accessNotes?: string;
  wifiNotes?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  lastClean?: string;
  nextTurnover?: string;
  updatedAt?: string;
}

export interface WorkLog {
  id: string;
  propertyId: string;
  taskId?: string;
  taskName?: string;
  taskCategory?: string;
  date: string;
  notes?: string;
  flag?: string;
  loggedBy?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  createdAt?: string;
  deleted?: boolean;
  photoDataUrl?: string;
}

export interface ScheduledTask {
  id: string;
  propertyId: string;
  taskId?: string;
  taskName?: string;
  scheduledDate: string;
  priority?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled' | string;
  assignedTo?: string;
  notes?: string;
  estimatedMinutes?: number;
  overdue?: boolean;
  completedAt?: string;
  completedBy?: string;
  completionPhotoUrl?: string;
}

export interface TaskTemplate {
  id: string;
  name: string;
  category: string;
  description?: string;
  baseMinutes?: number;
  common?: boolean;
  scalesWithBeds?: boolean;
  scalesWithBaths?: boolean;
  petsExtraMinutes?: number;
  hotTubExtraMinutes?: number;
  gardenExtraMinutes?: number;
}

export interface Employee {
  id: string;
  username: string;
  passwordHash?: string;
  role?: UserRole;
  jobType?: JobType;
  tenantId?: string;
  active?: boolean;
  tempPassword?: string;
  tempPasswordExpiry?: string;
  skills?: string;
  phone?: string;
  email?: string;
  displayName?: string;
  createdAt?: string;
}

export interface Visit {
  id: string;
  propertyId: string;
  scheduledDate: string;
  tasks?: string[];
  status?: string;
  notes?: string;
}

export interface TaskGroup {
  id: string;
  name: string;
  tasks: string[];
}

export interface ChecklistItem {
  id: string;
  title: string;
  category: string;
  description?: string;
  dueLabel?: string;
  completed?: boolean;
  completedAt?: string;
  completedBy?: string;
}

export type TenantCollection =
  | 'properties'
  | 'workLogs'
  | 'scheduledTasks'
  | 'taskTemplates'
  | 'employees'
  | 'visits'
  | 'taskGroups'
  | 'checklists'
  | 'deletedTasks';

export interface TenantData {
  properties: Property[];
  workLogs: WorkLog[];
  scheduledTasks: ScheduledTask[];
  taskTemplates: TaskTemplate[];
  employees: Employee[];
  visits: Visit[];
  taskGroups: TaskGroup[];
  checklists: ChecklistItem[];
  deletedTasks: Record<string, unknown>;
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export interface PendingChange {
  id: number;
  timestamp: string;
  type: string;
  path: string;
  data: unknown;
  method?: 'set' | 'update' | 'remove';
}

export type WriteMethod = 'set' | 'update' | 'remove';
