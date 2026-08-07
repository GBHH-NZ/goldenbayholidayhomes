/** User-facing NZ ops copy (no architecture jargon). */

import type { JobType } from '@/types';

export const COPY = {
  markDone: 'Mark done',
  markingDone: 'Saving…',
  activity: 'Activity',
  logWork: 'Log work',
  taskList: 'Task list',
  checklists: 'Checklists',
  dataHealth: 'Data health',
  overview: 'Overview',
  myDay: 'My day',
  mySchedule: 'My schedule',
  schedule: 'Schedule',
  properties: 'Holiday homes',
  team: 'Team',
  reports: 'Reports',
  integrations: 'Coming soon',
  completeTitle: 'Mark as done',
  completeHint: 'Optional note, flag, or photo for the manager.',
  photoAdd: 'Add photo',
  photoClear: 'Remove photo',
  flagNone: 'None',
  flagIssue: 'Issue',
  flagFollowUp: 'Follow up',
  flagDamage: 'Damage',
} as const;

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  cleaner: 'Cleaner',
  maintenance: 'Maintenance',
  manager: 'Manager',
  other: 'Other',
};

export function jobTypeLabel(jobType?: string | null): string {
  if (!jobType) return 'Staff';
  return JOB_TYPE_LABELS[jobType as JobType] ?? jobType;
}
