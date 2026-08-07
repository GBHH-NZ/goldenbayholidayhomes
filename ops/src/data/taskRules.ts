import type { CleaningTier, Property, TaskTemplate } from '@/types';

const TIER_MULTIPLIER: Record<CleaningTier, number> = {
  standard: 1,
  deep: 1.35,
  premium: 1.6,
};

/** Estimate minutes for a task template against a property profile. */
export function estimateTaskMinutes(template: TaskTemplate, property?: Property | null): number {
  let minutes = template.baseMinutes ?? 30;
  if (!property) return Math.round(minutes);

  if (template.scalesWithBeds) {
    minutes += Math.max(0, (property.bedrooms ?? 1) - 1) * 15;
  }
  if (template.scalesWithBaths) {
    minutes += Math.max(0, (property.bathrooms ?? 1) - 1) * 12;
  }
  if (property.petsAllowed && template.petsExtraMinutes) {
    minutes += template.petsExtraMinutes;
  }
  if (property.hasHotTub && template.hotTubExtraMinutes) {
    minutes += template.hotTubExtraMinutes;
  }
  if (property.hasGarden && template.gardenExtraMinutes) {
    minutes += template.gardenExtraMinutes;
  }

  const tier = property.cleaningTier ?? 'standard';
  minutes *= TIER_MULTIPLIER[tier] ?? 1;

  if (property.approximateSqm && property.approximateSqm > 120) {
    minutes += Math.floor((property.approximateSqm - 120) / 40) * 10;
  }

  return Math.round(minutes);
}

/** Human-readable duration, e.g. 45m · 1h 45m · 7h 38m */
export function formatDuration(minutes: number | null | undefined): string {
  if (minutes == null || Number.isNaN(minutes)) return '—';
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem === 0 ? `${h}h` : `${h}h ${rem}m`;
}

export function estimatePropertyTurnoverMinutes(
  templates: TaskTemplate[],
  property: Property
): number {
  return templates
    .filter((t) => t.common)
    .reduce((sum, t) => sum + estimateTaskMinutes(t, property), 0);
}

export const DEFAULT_TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: 'task_turnover',
    name: 'Full Turnover Clean',
    category: 'Cleaning',
    description: 'Complete clean between guest stays',
    baseMinutes: 90,
    common: true,
    scalesWithBeds: true,
    scalesWithBaths: true,
    petsExtraMinutes: 25,
    hotTubExtraMinutes: 20,
  },
  {
    id: 'task_linen',
    name: 'Linen Change',
    category: 'Cleaning',
    description: 'Strip and remake all beds, towels',
    baseMinutes: 25,
    common: true,
    scalesWithBeds: true,
  },
  {
    id: 'task_restock',
    name: 'Restock Supplies',
    category: 'Housekeeping',
    description: 'Toiletries, kitchen basics, firewood notes',
    baseMinutes: 20,
    common: true,
  },
  {
    id: 'task_bathroom',
    name: 'Bathroom Deep Clean',
    category: 'Cleaning',
    description: 'Bathrooms only',
    baseMinutes: 30,
    common: true,
    scalesWithBaths: true,
  },
  {
    id: 'task_garden',
    name: 'Garden & Lawn',
    category: 'Maintenance',
    description: 'Mow, edge, tidy outdoor areas',
    baseMinutes: 40,
    common: true,
    gardenExtraMinutes: 20,
  },
  {
    id: 'task_hottub',
    name: 'Hot Tub Service',
    category: 'Maintenance',
    description: 'Chemicals, cover, rinse',
    baseMinutes: 25,
    common: false,
    hotTubExtraMinutes: 15,
  },
  {
    id: 'task_inspection',
    name: 'Pre-arrival Inspection',
    category: 'Quality',
    description: 'Walkthrough checklist before guests arrive',
    baseMinutes: 20,
    common: true,
  },
  {
    id: 'task_maintenance',
    name: 'Minor Maintenance',
    category: 'Maintenance',
    description: 'Fix small issues reported by guests or staff',
    baseMinutes: 45,
    common: false,
  },
  {
    id: 'task_window',
    name: 'Window Clean',
    category: 'Cleaning',
    description: 'Interior (and exterior where safe)',
    baseMinutes: 35,
    common: false,
    scalesWithBeds: true,
  },
  {
    id: 'task_pool',
    name: 'Pool Check',
    category: 'Maintenance',
    description: 'Water quality and debris',
    baseMinutes: 20,
    common: false,
  },
];
