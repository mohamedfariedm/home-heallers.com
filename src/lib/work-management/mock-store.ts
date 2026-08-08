import type {
  ActivityEntry,
  AssignmentHistoryEntry,
  Attachment,
  Comment,
  Department,
  Project,
  SavedView,
  StatusHistoryEntry,
  WmNotification,
  WmUser,
  WorkItem,
  WorkItemLink,
  WorkLog,
  WorkflowDefinition,
} from '@/types/work-management';
import { BUILTIN_WORKFLOWS, DEFAULT_WORKFLOW_ID } from './workflow';

export const WM_STORAGE_KEY = 'home-heller-work-management-v1';

export interface WorkManagementStore {
  users: WmUser[];
  departments: Department[];
  projects: Project[];
  workItems: WorkItem[];
  assignmentHistory: AssignmentHistoryEntry[];
  statusHistory: StatusHistoryEntry[];
  activities: ActivityEntry[];
  comments: Comment[];
  attachments: Attachment[];
  workLogs: WorkLog[];
  links: WorkItemLink[];
  savedViews: SavedView[];
  notifications: WmNotification[];
  workflows: WorkflowDefinition[];
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function createSeedStore(): WorkManagementStore {
  const now = new Date().toISOString();
  const users: WmUser[] = [
    { id: 'u-1', name: 'Ahmed Hassan', email: 'ahmed@homeheller.com', active: true },
    { id: 'u-2', name: 'Mohamed Ali', email: 'mohamed@homeheller.com', active: true },
    { id: 'u-3', name: 'Sara Ibrahim', email: 'sara@homeheller.com', active: true },
    { id: 'u-4', name: 'Nour Khaled', email: 'nour@homeheller.com', active: true },
    { id: 'u-5', name: 'Omar Farouk', email: 'omar@homeheller.com', active: true },
  ];

  const departments: Department[] = [
    {
      id: 'dept-eng',
      name: 'Engineering',
      description: 'Product engineering and platform',
      managerId: 'u-1',
      memberIds: ['u-1', 'u-2', 'u-3'],
      status: 'active',
      workflowId: DEFAULT_WORKFLOW_ID,
      createdAt: isoDaysAgo(60),
      updatedAt: now,
    },
    {
      id: 'dept-care',
      name: 'Care Operations',
      description: 'Clinical operations and care delivery',
      managerId: 'u-4',
      memberIds: ['u-4', 'u-5', 'u-3'],
      status: 'active',
      workflowId: DEFAULT_WORKFLOW_ID,
      createdAt: isoDaysAgo(45),
      updatedAt: now,
    },
    {
      id: 'dept-hr',
      name: 'Human Resources',
      description: 'People operations',
      managerId: 'u-1',
      memberIds: ['u-1', 'u-5'],
      status: 'active',
      workflowId: 'wf-hr',
      createdAt: isoDaysAgo(30),
      updatedAt: now,
    },
  ];

  const projects: Project[] = [
    {
      id: 'proj-care',
      key: 'CARE',
      name: 'Care Platform',
      description: 'Core care booking and delivery platform',
      departmentId: 'dept-eng',
      ownerId: 'u-1',
      memberIds: ['u-1', 'u-2', 'u-3'],
      startDate: isoDaysAgo(40),
      dueDate: isoDaysFromNow(90),
      status: 'active',
      nextSequence: 104,
      workflowId: DEFAULT_WORKFLOW_ID,
      createdAt: isoDaysAgo(40),
      updatedAt: now,
    },
    {
      id: 'proj-ops',
      key: 'OPS',
      name: 'Operations Hub',
      description: 'Internal ops tooling',
      departmentId: 'dept-care',
      ownerId: 'u-4',
      memberIds: ['u-4', 'u-5'],
      startDate: isoDaysAgo(20),
      dueDate: isoDaysFromNow(60),
      status: 'active',
      nextSequence: 12,
      workflowId: DEFAULT_WORKFLOW_ID,
      createdAt: isoDaysAgo(20),
      updatedAt: now,
    },
  ];

  const workItems: WorkItem[] = [
    {
      id: 'wi-100',
      key: 'CARE-100',
      title: 'Checkout Improvements',
      description: 'Parent story for checkout reliability work.',
      type: 'story',
      status: 'in_progress',
      priority: 'high',
      projectId: 'proj-care',
      departmentId: 'dept-eng',
      reporterId: 'u-1',
      assigneeId: 'u-1',
      createdById: 'u-1',
      dueDate: isoDaysFromNow(14),
      estimate: { originalHours: 24, remainingHours: 10, completedHours: 14 },
      tags: ['checkout', 'payments'],
      parentId: null,
      createdAt: isoDaysAgo(10),
      updatedAt: now,
    },
    {
      id: 'wi-101',
      key: 'CARE-101',
      title: 'Implement checkout API',
      description: 'Validate payment and create order.',
      type: 'task',
      status: 'in_progress',
      priority: 'high',
      projectId: 'proj-care',
      departmentId: 'dept-eng',
      reporterId: 'u-1',
      assigneeId: 'u-2',
      createdById: 'u-1',
      dueDate: isoDaysFromNow(5),
      estimate: { originalHours: 8, remainingHours: 3, completedHours: 5 },
      tags: ['api'],
      parentId: 'wi-100',
      createdAt: isoDaysAgo(8),
      updatedAt: now,
    },
    {
      id: 'wi-102',
      key: 'CARE-102',
      title: 'Build checkout UI',
      description: 'Responsive checkout screens.',
      type: 'task',
      status: 'ready_to_test',
      priority: 'medium',
      projectId: 'proj-care',
      departmentId: 'dept-eng',
      reporterId: 'u-1',
      assigneeId: 'u-3',
      createdById: 'u-1',
      dueDate: isoDaysFromNow(7),
      estimate: { originalHours: 8, remainingHours: 0, completedHours: 8 },
      tags: ['ui'],
      parentId: 'wi-100',
      createdAt: isoDaysAgo(7),
      updatedAt: now,
    },
    {
      id: 'wi-103',
      key: 'CARE-103',
      title: 'Fix coupon calculation',
      description: 'Coupons apply incorrectly with VAT.',
      type: 'bug',
      status: 'new',
      priority: 'critical',
      projectId: 'proj-care',
      departmentId: 'dept-eng',
      reporterId: 'u-3',
      assigneeId: null,
      createdById: 'u-3',
      dueDate: isoDaysAgo(1),
      estimate: { originalHours: 4, remainingHours: 4, completedHours: 0 },
      tags: ['coupons'],
      parentId: 'wi-100',
      bug: {
        stepsToReproduce: '1. Add item\n2. Apply coupon\n3. Checkout',
        expectedResult: 'Discount applied after VAT correctly',
        actualResult: 'Discount applied before VAT',
        environment: 'Staging',
        severity: 'major',
      },
      createdAt: isoDaysAgo(3),
      updatedAt: now,
    },
    {
      id: 'wi-1',
      key: 'OPS-1',
      title: 'Onboard new care centers',
      description: 'Checklist for center onboarding.',
      type: 'improvement',
      status: 'new',
      priority: 'medium',
      projectId: 'proj-ops',
      departmentId: 'dept-care',
      reporterId: 'u-4',
      assigneeId: 'u-5',
      createdById: 'u-4',
      dueDate: isoDaysFromNow(21),
      estimate: { originalHours: 6, remainingHours: 6, completedHours: 0 },
      tags: ['onboarding'],
      parentId: null,
      createdAt: isoDaysAgo(2),
      updatedAt: now,
    },
  ];

  const activities: ActivityEntry[] = [
    {
      id: 'act-1',
      workItemId: 'wi-100',
      action: 'created',
      actorId: 'u-1',
      message: 'Ahmed Hassan created CARE-100',
      createdAt: isoDaysAgo(10),
    },
    {
      id: 'act-2',
      workItemId: 'wi-101',
      action: 'assigned',
      actorId: 'u-1',
      message: 'Ahmed Hassan assigned CARE-101 to Mohamed Ali',
      meta: { toAssigneeId: 'u-2' },
      createdAt: isoDaysAgo(8),
    },
    {
      id: 'act-3',
      workItemId: 'wi-101',
      action: 'status_changed',
      actorId: 'u-2',
      message: 'Mohamed Ali changed New → In Progress',
      meta: { fromStatus: 'new', toStatus: 'in_progress' },
      createdAt: isoDaysAgo(7),
    },
  ];

  return {
    users,
    departments,
    projects,
    workItems,
    assignmentHistory: [],
    statusHistory: [
      {
        id: 'sh-1',
        workItemId: 'wi-101',
        fromStatus: 'new',
        toStatus: 'in_progress',
        changedById: 'u-2',
        changedAt: isoDaysAgo(7),
      },
    ],
    activities,
    comments: [
      {
        id: 'c-1',
        workItemId: 'wi-101',
        authorId: 'u-2',
        body: 'Started payment validation. @Sara please review the edge cases.',
        mentionIds: ['u-3'],
        createdAt: isoDaysAgo(5),
        updatedAt: isoDaysAgo(5),
        deletedAt: null,
      },
    ],
    attachments: [],
    workLogs: [
      {
        id: 'wl-1',
        workItemId: 'wi-101',
        userId: 'u-2',
        hours: 2,
        date: isoDaysAgo(4).slice(0, 10),
        description: 'Implemented payment validation',
        createdAt: isoDaysAgo(4),
      },
    ],
    links: [
      {
        id: 'lnk-1',
        sourceId: 'wi-103',
        targetId: 'wi-101',
        type: 'blocked_by',
        createdById: 'u-3',
        createdAt: isoDaysAgo(2),
      },
    ],
    savedViews: [
      {
        id: 'sv-1',
        userId: 'u-1',
        name: 'My Open Bugs',
        filters: { type: 'bug', myWorkUserId: 'u-1', status: '' },
        createdAt: isoDaysAgo(1),
        updatedAt: isoDaysAgo(1),
      },
      {
        id: 'sv-2',
        userId: 'u-1',
        name: 'Critical Bugs',
        filters: { type: 'bug', priority: 'critical' },
        createdAt: isoDaysAgo(1),
        updatedAt: isoDaysAgo(1),
      },
      {
        id: 'sv-3',
        userId: 'u-1',
        name: 'Unassigned Tasks',
        filters: { unassigned: true },
        createdAt: isoDaysAgo(1),
        updatedAt: isoDaysAgo(1),
      },
    ],
    notifications: [
      {
        id: 'n-1',
        userId: 'u-2',
        type: 'assigned',
        title: 'Assigned CARE-101',
        body: 'You were assigned CARE-101 — Implement checkout API',
        workItemId: 'wi-101',
        read: false,
        createdAt: isoDaysAgo(8),
      },
    ],
    workflows: [...BUILTIN_WORKFLOWS],
  };
}

export function loadStore(): WorkManagementStore {
  if (typeof window === 'undefined') {
    return createSeedStore();
  }
  try {
    const raw = localStorage.getItem(WM_STORAGE_KEY);
    if (!raw) {
      const seed = createSeedStore();
      localStorage.setItem(WM_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as WorkManagementStore;
    // Ensure workflows always present
    if (!parsed.workflows?.length) {
      parsed.workflows = [...BUILTIN_WORKFLOWS];
    }
    return parsed;
  } catch {
    const seed = createSeedStore();
    localStorage.setItem(WM_STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
}

export function saveStore(store: WorkManagementStore): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WM_STORAGE_KEY, JSON.stringify(store));
}

export function resetStore(): WorkManagementStore {
  const seed = createSeedStore();
  saveStore(seed);
  return seed;
}

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}
