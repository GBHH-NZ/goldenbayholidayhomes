import type {
  ChecklistItem,
  Employee,
  Property,
  ScheduledTask,
  TenantData,
  Visit,
  WorkLog,
} from '@/types';
import { DEFAULT_TASK_TEMPLATES, estimateTaskMinutes } from './taskRules';

/** Deterministic PRNG for stable seed data across reloads. */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

function daysFromToday(offset: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

const TOWNS = [
  { town: 'Pohara', lat: -40.835, lng: 172.885 },
  { town: 'Collingwood', lat: -40.68, lng: 172.68 },
  { town: 'Tata Beach', lat: -40.81, lng: 172.91 },
  { town: 'Takaka', lat: -40.855, lng: 172.805 },
  { town: 'Parapara', lat: -40.72, lng: 172.69 },
  { town: 'Ligaro', lat: -40.79, lng: 172.78 },
  { town: 'Onekaka', lat: -40.75, lng: 172.7 },
  { town: 'Patons Rock', lat: -40.79, lng: 172.86 },
  { town: 'Milnthorpe', lat: -40.67, lng: 172.67 },
  { town: 'Wainui', lat: -40.82, lng: 172.95 },
] as const;

const PROPERTY_NAMES = [
  'Seaview Cottage',
  'Bush Retreat',
  'Estuary House',
  'Hilltop Villa',
  'Beach Bach',
  'Riverbend Lodge',
  'Golden Sands',
  'Fern Grove',
  'Harbour Light',
  'Mountain View',
  'Tide Pool Cabin',
  'Cedar Nest',
];

export function createSeedTenantData(tenantId = 'demo'): TenantData {
  const rng = mulberry32(20260806);

  const properties: Property[] = PROPERTY_NAMES.map((name, i) => {
    const loc = TOWNS[i % TOWNS.length]!;
    const bedrooms = 1 + Math.floor(rng() * 4);
    const bathrooms = Math.max(1, Math.round(bedrooms * 0.6 + rng()));
    const tiers = ['standard', 'deep', 'premium'] as const;
    return {
      id: `prop_${1000 + i}`,
      name,
      address: `${10 + i * 3} ${pick(rng, ['Beach', 'Valley', 'Coast', 'Hill'])} Rd`,
      town: loc.town,
      latitude: loc.lat + (rng() - 0.5) * 0.02,
      longitude: loc.lng + (rng() - 0.5) * 0.02,
      bedrooms,
      bathrooms,
      maxGuests: bedrooms * 2 + Math.floor(rng() * 2),
      petsAllowed: rng() > 0.55,
      cleaningTier: pick(rng, [...tiers]),
      approximateSqm: 70 + Math.floor(rng() * 140),
      hasHotTub: rng() > 0.6,
      hasPool: rng() > 0.85,
      hasGarden: rng() > 0.35,
      linenIncluded: true,
      status: 'active',
      archived: false,
      notes: rng() > 0.5 ? 'Key safe code with office.' : undefined,
      accessNotes: 'Park on gravel; side gate latch.',
      wifiNotes: 'Network: GBHH-Guest · password on fridge',
      emergencyContact: 'Office',
      emergencyPhone: '0800 150 810',
      lastClean: daysFromToday(-Math.floor(rng() * 10)),
      nextTurnover: daysFromToday(Math.floor(rng() * 8)),
      updatedAt: new Date().toISOString(),
    };
  });

  const taskTemplates = DEFAULT_TASK_TEMPLATES.map((t) => ({ ...t }));

  const employees: Employee[] = [
    {
      id: 'emp_admin',
      username: 'test',
      role: 'admin',
      tenantId,
      active: true,
      displayName: 'Test Admin',
      email: 'admin@gbholidayhomes.co.nz',
      phone: '0800 150 810',
      skills: 'Scheduling, inspections',
      createdAt: new Date().toISOString(),
      tempPassword: 'test',
    },
    {
      id: 'emp_cleaner1',
      username: 'sarah',
      role: 'employee',
      tenantId,
      active: true,
      displayName: 'Sarah Clean',
      email: 'sarah@example.com',
      phone: '021 000 0001',
      skills: 'Turnover, linen',
      tempPassword: 'sarah',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'emp_cleaner2',
      username: 'mike',
      role: 'employee',
      tenantId,
      active: true,
      displayName: 'Mike Maintenance',
      email: 'mike@example.com',
      phone: '021 000 0002',
      skills: 'Garden, hot tub, repairs',
      tempPassword: 'mike',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'emp_cleaner3',
      username: 'ana',
      role: 'employee',
      tenantId,
      active: true,
      displayName: 'Ana Housekeeping',
      email: 'ana@example.com',
      phone: '021 000 0003',
      skills: 'Deep clean, restock',
      tempPassword: 'ana',
      createdAt: new Date().toISOString(),
    },
  ];

  const assignees = employees.map((e) => e.username);
  const scheduledTasks: ScheduledTask[] = [];
  let schedId = 1;
  for (let d = -5; d <= 10; d++) {
    const count = 2 + Math.floor(rng() * 3);
    for (let c = 0; c < count; c++) {
      const property = pick(rng, properties);
      const template = pick(rng, taskTemplates.filter((t) => t.common || rng() > 0.4));
      const status =
        d < 0
          ? pick(rng, ['completed', 'completed', 'cancelled'] as const)
          : d === 0
            ? pick(rng, ['pending', 'in_progress'] as const)
            : 'pending';
      const overdue = d < -1 && status === 'pending';
      scheduledTasks.push({
        id: `sched_${schedId++}`,
        propertyId: property.id,
        taskId: template.id,
        taskName: template.name,
        scheduledDate: daysFromToday(d),
        priority: pick(rng, ['normal', 'normal', 'high', 'low']),
        status: overdue ? 'pending' : status,
        assignedTo: pick(rng, assignees),
        notes: rng() > 0.7 ? 'Guest early check-in' : undefined,
        estimatedMinutes: estimateTaskMinutes(template, property),
        overdue: overdue || (d < 0 && status === 'pending'),
      });
    }
  }

  const workLogs: WorkLog[] = [];
  let logId = 1;
  for (let i = 0; i < 40; i++) {
    const property = pick(rng, properties);
    const template = pick(rng, taskTemplates);
    const est = estimateTaskMinutes(template, property);
    const day = daysFromToday(-Math.floor(rng() * 21));
    workLogs.push({
      id: `log_${logId++}`,
      propertyId: property.id,
      taskId: template.id,
      taskName: template.name,
      taskCategory: template.category,
      date: day,
      notes: rng() > 0.6 ? 'All good' : rng() > 0.5 ? 'Restocked soap' : undefined,
      flag: rng() > 0.88 ? 'issue' : rng() > 0.92 ? 'follow_up' : undefined,
      loggedBy: pick(rng, assignees),
      estimatedMinutes: est,
      actualMinutes: Math.max(10, Math.round(est * (0.8 + rng() * 0.5))),
      createdAt: `${day}T14:00:00.000Z`,
    });
  }

  const checklists: ChecklistItem[] = [
    {
      id: 'chk_insurance',
      title: 'Public liability insurance renewal',
      category: 'Compliance',
      description: 'Confirm cover for all managed properties',
      dueLabel: '1 April',
      completed: false,
    },
    {
      id: 'chk_smoke',
      title: 'Smoke alarm battery check — all properties',
      category: 'Safety',
      description: 'Quarterly circuit',
      dueLabel: 'Quarterly',
      completed: true,
      completedAt: daysFromToday(-12),
      completedBy: 'mike',
    },
    {
      id: 'chk_inventory',
      title: 'Linen inventory count',
      category: 'Inventory',
      description: 'Sheets, towels, duvet inners',
      dueLabel: 'Monthly',
      completed: false,
    },
    {
      id: 'chk_keys',
      title: 'Key & lockbox audit',
      category: 'Security',
      dueLabel: 'Twice yearly',
      completed: false,
    },
    {
      id: 'chk_gas',
      title: 'Gas bottle / heater safety check',
      category: 'Safety',
      dueLabel: 'Pre-winter',
      completed: false,
    },
    {
      id: 'chk_wifi',
      title: 'Guest Wi‑Fi credentials refresh',
      category: 'Housekeeping',
      dueLabel: 'As needed',
      completed: true,
      completedAt: daysFromToday(-3),
      completedBy: 'test',
    },
  ];

  const visits: Visit[] = properties.slice(0, 4).map((p, i) => ({
    id: `visit_${i + 1}`,
    propertyId: p.id,
    scheduledDate: daysFromToday(i + 2),
    tasks: ['task_inspection'],
    status: 'planned',
    notes: 'Owner walkthrough',
  }));

  return {
    properties,
    workLogs,
    scheduledTasks,
    taskTemplates,
    employees,
    visits,
    taskGroups: [
      {
        id: 'tg_turnover',
        name: 'Standard Turnover',
        tasks: ['task_turnover', 'task_linen', 'task_restock', 'task_inspection'],
      },
      {
        id: 'tg_weekly',
        name: 'Weekly Maintenance',
        tasks: ['task_garden', 'task_hottub'],
      },
    ],
    checklists,
    deletedTasks: {},
  };
}
