import type { Dispatch, SetStateAction } from 'react';
import type { ScheduledTask, TaskTemplate, TenantData, WorkLog } from '@/types';
import { mutate, newId, tenantPath } from '@/services/mutations';

export interface CompleteTaskOptions {
  tenantId: string;
  username: string;
  task: ScheduledTask;
  templates: TaskTemplate[];
  setData: Dispatch<SetStateAction<TenantData>>;
  notes?: string;
  flag?: string;
  actualMinutes?: number;
  photoDataUrl?: string;
}

/** Mark a scheduled task complete and append a work log (visible on manager dashboard). */
export async function completeScheduledTask(opts: CompleteTaskOptions): Promise<void> {
  const { tenantId, username, task, templates, setData, notes, flag, actualMinutes, photoDataUrl } =
    opts;
  const now = new Date().toISOString();

  const updated: ScheduledTask = {
    ...task,
    status: 'completed',
    overdue: false,
    completedAt: now,
    completedBy: username,
    notes: notes ?? task.notes,
    completionPhotoUrl: photoDataUrl,
  };

  await mutate(tenantPath(tenantId, 'scheduledTasks', task.id), updated, 'complete_sched', 'set', () => {
    setData((d) => ({
      ...d,
      scheduledTasks: d.scheduledTasks.map((t) => (t.id === task.id ? updated : t)),
    }));
  });

  const template = templates.find((t) => t.id === task.taskId);
  const logId = newId('log');
  const log: WorkLog = {
    id: logId,
    propertyId: task.propertyId,
    taskId: task.taskId,
    taskName: task.taskName,
    taskCategory: template?.category,
    date: now.slice(0, 10),
    loggedBy: username,
    estimatedMinutes: task.estimatedMinutes,
    actualMinutes: actualMinutes ?? task.estimatedMinutes,
    notes: notes ?? task.notes,
    flag: flag || undefined,
    createdAt: now,
    photoDataUrl,
  };

  await mutate(tenantPath(tenantId, 'workLogs', logId), log, 'log_from_sched', 'set', () => {
    setData((d) => ({ ...d, workLogs: [...d.workLogs, log] }));
  });
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isTaskOpen(task: ScheduledTask): boolean {
  return task.status !== 'completed' && task.status !== 'cancelled';
}

export function isTaskOverdue(task: ScheduledTask): boolean {
  if (!isTaskOpen(task)) return false;
  return Boolean(task.overdue) || task.scheduledDate < todayIso();
}
