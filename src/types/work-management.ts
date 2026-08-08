/** Work Management domain types — mirror future Laravel API shapes. */

export type DepartmentStatus = 'active' | 'archived';
export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived';

export type WorkItemType = 'task' | 'bug' | 'story' | 'improvement';
export type WorkItemPriority = 'critical' | 'high' | 'medium' | 'low';
export type BugSeverity =
  | 'blocker'
  | 'critical'
  | 'major'
  | 'minor'
  | 'trivial';

export type WorkItemStatus =
  | 'new'
  | 'in_progress'
  | 'ready_to_test'
  | 'testing'
  | 'done'
  | 'blocked'
  | 'reopened'
  | 'cancelled'
  | string; // allows custom workflow statuses (Epic 19)

export type WorkItemLinkType =
  | 'blocks'
  | 'blocked_by'
  | 'related_to'
  | 'duplicate_of';

export type ActivityAction =
  | 'created'
  | 'updated'
  | 'assigned'
  | 'unassigned'
  | 'status_changed'
  | 'priority_changed'
  | 'comment_added'
  | 'comment_edited'
  | 'comment_deleted'
  | 'attachment_added'
  | 'attachment_removed'
  | 'work_logged'
  | 'link_added'
  | 'link_removed'
  | 'parent_changed'
  | 'estimate_updated'
  | 'reopened';

export type WmNotificationType =
  | 'assigned'
  | 'mentioned'
  | 'status_changed'
  | 'commented'
  | 'reopened'
  | 'due_soon';

export interface WmUser {
  id: string;
  name: string;
  email: string;
  active: boolean;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  managerId: string | null;
  memberIds: string[];
  status: DepartmentStatus;
  /** Optional workflow id for Epic 19 */
  workflowId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  key: string;
  name: string;
  description: string;
  departmentId: string;
  ownerId: string | null;
  memberIds: string[];
  startDate: string | null;
  dueDate: string | null;
  status: ProjectStatus;
  nextSequence: number;
  workflowId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BugFields {
  stepsToReproduce?: string;
  expectedResult?: string;
  actualResult?: string;
  environment?: string;
  severity?: BugSeverity;
}

export interface TimeEstimate {
  originalHours: number;
  remainingHours: number;
  completedHours: number;
}

export interface WorkItem {
  id: string;
  key: string;
  title: string;
  description: string;
  type: WorkItemType;
  status: WorkItemStatus;
  priority: WorkItemPriority;
  projectId: string;
  departmentId: string;
  reporterId: string;
  assigneeId: string | null;
  createdById: string;
  dueDate: string | null;
  estimate: TimeEstimate;
  tags: string[];
  parentId: string | null;
  bug?: BugFields;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentHistoryEntry {
  id: string;
  workItemId: string;
  fromAssigneeId: string | null;
  toAssigneeId: string | null;
  changedById: string;
  changedAt: string;
}

export interface StatusHistoryEntry {
  id: string;
  workItemId: string;
  fromStatus: WorkItemStatus;
  toStatus: WorkItemStatus;
  changedById: string;
  changedAt: string;
}

export interface ActivityEntry {
  id: string;
  workItemId: string;
  action: ActivityAction;
  actorId: string;
  message: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

export interface Comment {
  id: string;
  workItemId: string;
  authorId: string;
  body: string;
  mentionIds: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Attachment {
  id: string;
  workItemId: string;
  name: string;
  mimeType: string;
  size: number;
  /** Public URL from attachment endpoint (or data URL for legacy mock) */
  dataUrl: string;
  original?: string;
  thumbnail?: string;
  serverId?: string | number;
  uploadedById: string;
  createdAt: string;
}

export interface WorkLog {
  id: string;
  workItemId: string;
  userId: string;
  hours: number;
  date: string;
  description: string;
  createdAt: string;
}

export interface WorkItemLink {
  id: string;
  sourceId: string;
  targetId: string;
  type: WorkItemLinkType;
  createdById: string;
  createdAt: string;
}

export interface SavedView {
  id: string;
  userId: string;
  name: string;
  filters: WorkItemFilters;
  createdAt: string;
  updatedAt: string;
}

export interface WmNotification {
  id: string;
  userId: string;
  type: WmNotificationType;
  title: string;
  body: string;
  workItemId?: string;
  read: boolean;
  createdAt: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  /** ordered column statuses for board */
  statuses: WorkItemStatus[];
  /** from → allowed tos */
  transitions: Record<string, WorkItemStatus[]>;
}

export interface WorkItemFilters {
  q?: string;
  id?: string;
  projectId?: string;
  departmentId?: string;
  type?: WorkItemType | '';
  status?: WorkItemStatus | '';
  priority?: WorkItemPriority | '';
  assigneeId?: string;
  reporterId?: string;
  tags?: string[];
  createdFrom?: string;
  createdTo?: string;
  dueFrom?: string;
  dueTo?: string;
  overdue?: boolean;
  unassigned?: boolean;
  parentId?: string | null;
  myWorkUserId?: string;
}

export interface DashboardKpis {
  openWork: number;
  inProgress: number;
  readyToTest: number;
  overdue: number;
  criticalBugs: number;
  completedThisWeek: number;
  byStatus: { status: string; count: number }[];
  bySeverity: { severity: string; count: number }[];
  byDepartment: { departmentId: string; name: string; count: number }[];
  byAssignee: { userId: string; name: string; count: number }[];
  completedTrend: { date: string; count: number }[];
}

export interface CreateDepartmentInput {
  name: string;
  description?: string;
  managerId?: string | null;
  memberIds?: string[];
}

export interface UpdateDepartmentInput {
  id: string;
  name?: string;
  description?: string;
  managerId?: string | null;
  memberIds?: string[];
  status?: DepartmentStatus;
}

export interface CreateProjectInput {
  key: string;
  name: string;
  description?: string;
  departmentId: string;
  ownerId?: string | null;
  memberIds?: string[];
  startDate?: string | null;
  dueDate?: string | null;
  status?: ProjectStatus;
  workflowId?: string | null;
}

export interface UpdateProjectInput {
  id: string;
  key?: string;
  name?: string;
  description?: string;
  departmentId?: string;
  ownerId?: string | null;
  memberIds?: string[];
  startDate?: string | null;
  dueDate?: string | null;
  status?: ProjectStatus;
  workflowId?: string | null;
}

export interface CreateWorkItemInput {
  title: string;
  description?: string;
  type: WorkItemType;
  priority?: WorkItemPriority;
  projectId: string;
  assigneeId?: string | null;
  dueDate?: string | null;
  tags?: string[];
  parentId?: string | null;
  estimate?: Partial<TimeEstimate>;
  bug?: BugFields;
  reporterId: string;
  createdById: string;
}

export interface UpdateWorkItemInput {
  id: string;
  title?: string;
  description?: string;
  type?: WorkItemType;
  priority?: WorkItemPriority;
  dueDate?: string | null;
  tags?: string[];
  parentId?: string | null;
  estimate?: Partial<TimeEstimate>;
  bug?: BugFields;
  actorId: string;
}

export const WORK_ITEM_TYPE_LABELS: Record<WorkItemType, string> = {
  task: 'Task',
  bug: 'Bug',
  story: 'User Story',
  improvement: 'Improvement',
};

export const WORK_ITEM_PRIORITY_LABELS: Record<WorkItemPriority, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const WORK_ITEM_STATUS_LABELS: Record<string, string> = {
  new: 'New',
  in_progress: 'In Progress',
  ready_to_test: 'Ready to Test',
  testing: 'Testing',
  done: 'Done',
  blocked: 'Blocked',
  reopened: 'Reopened',
  cancelled: 'Cancelled',
};

export const BUG_SEVERITY_LABELS: Record<BugSeverity, string> = {
  blocker: 'Blocker',
  critical: 'Critical',
  major: 'Major',
  minor: 'Minor',
  trivial: 'Trivial',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
  archived: 'Archived',
};
