import type { WorkItemStatus, WorkflowDefinition } from '@/types/work-management';

export const DEFAULT_WORKFLOW_ID = 'wf-default-dev';

export const DEFAULT_WORKFLOW: WorkflowDefinition = {
  id: DEFAULT_WORKFLOW_ID,
  name: 'Development',
  statuses: [
    'new',
    'in_progress',
    'ready_to_test',
    'testing',
    'done',
    'blocked',
    'reopened',
    'cancelled',
  ],
  transitions: {
    new: ['in_progress', 'blocked', 'cancelled'],
    in_progress: ['ready_to_test', 'blocked', 'cancelled', 'new'],
    ready_to_test: ['testing', 'in_progress', 'cancelled'],
    testing: ['done', 'reopened', 'ready_to_test'],
    done: ['reopened'],
    blocked: ['new', 'in_progress', 'cancelled'],
    reopened: ['in_progress', 'ready_to_test', 'cancelled'],
    cancelled: ['new', 'reopened'],
  },
};

export const HR_WORKFLOW: WorkflowDefinition = {
  id: 'wf-hr',
  name: 'HR',
  statuses: ['new', 'under_review', 'approved', 'completed', 'cancelled'],
  transitions: {
    new: ['under_review', 'cancelled'],
    under_review: ['approved', 'new', 'cancelled'],
    approved: ['completed', 'under_review'],
    completed: [],
    cancelled: ['new'],
  },
};

export const SUPPORT_WORKFLOW: WorkflowDefinition = {
  id: 'wf-support',
  name: 'Support',
  statuses: [
    'open',
    'investigating',
    'waiting_customer',
    'resolved',
    'closed',
    'cancelled',
  ],
  transitions: {
    open: ['investigating', 'cancelled'],
    investigating: ['waiting_customer', 'resolved', 'cancelled'],
    waiting_customer: ['investigating', 'resolved', 'cancelled'],
    resolved: ['closed', 'investigating'],
    closed: [],
    cancelled: ['open'],
  },
};

export const BUILTIN_WORKFLOWS: WorkflowDefinition[] = [
  DEFAULT_WORKFLOW,
  HR_WORKFLOW,
  SUPPORT_WORKFLOW,
];

export function canTransition(
  workflow: WorkflowDefinition,
  from: WorkItemStatus,
  to: WorkItemStatus
): boolean {
  if (from === to) return false;
  const allowed = workflow.transitions[from] ?? [];
  return allowed.includes(to);
}

export function getBoardColumns(workflow: WorkflowDefinition): WorkItemStatus[] {
  // Board typically shows happy-path + blocked/reopened; exclude cancelled from default board
  return workflow.statuses.filter((s) => s !== 'cancelled');
}
