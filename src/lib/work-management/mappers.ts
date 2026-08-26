/**
 * Map Laravel Work Management snake_case API payloads ↔ frontend camelCase types.
 */
import type {
  ActivityEntry,
  Attachment,
  Comment,
  CreateDepartmentInput,
  CreateProjectInput,
  CreateWorkItemInput,
  DashboardKpis,
  Department,
  Project,
  SavedView,
  UpdateDepartmentInput,
  UpdateProjectInput,
  UpdateWorkItemInput,
  WmNotification,
  WmUser,
  WorkItem,
  WorkItemFilters,
  WorkItemLink,
  WorkLog,
  WorkflowDefinition,
} from '@/types/work-management';

export function idStr(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return '';
  return String(v);
}

export function idNum(v: string | number | null | undefined): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function unwrapData<T>(payload: any): T {
  if (payload == null) return payload as T;
  // Axios full response from HttpClient.post
  if (payload?.data?.data !== undefined && payload?.status !== undefined && payload?.headers) {
    const inner = payload.data.data;
    return (Array.isArray(inner) ? inner[0] ?? inner : inner) as T;
  }
  // { data: T } or { data: [T] }
  if (payload?.data !== undefined) {
    const d = payload.data;
    if (Array.isArray(d)) return (d[0] ?? d) as T;
    return d as T;
  }
  return payload as T;
}

export function unwrapList<T>(payload: any): T[] {
  if (payload == null) return [];
  if (payload?.data?.data !== undefined && Array.isArray(payload.data.data)) {
    return payload.data.data as T[];
  }
  if (Array.isArray(payload?.data)) return payload.data as T[];
  if (Array.isArray(payload)) return payload as T[];
  return [];
}

export function mapDepartment(raw: any): Department {
  return {
    id: idStr(raw.id),
    name: raw.name ?? '',
    description: raw.description ?? '',
    managerId: raw.manager_id != null ? idStr(raw.manager_id) : null,
    memberIds: (raw.member_ids ?? []).map(idStr),
    status: raw.status ?? 'active',
    workflowId: raw.workflow_id ?? null,
    createdAt: raw.created_at ?? '',
    updatedAt: raw.updated_at ?? '',
  };
}

export function mapProject(raw: any): Project {
  return {
    id: idStr(raw.id),
    key: raw.key ?? '',
    name: raw.name ?? '',
    description: raw.description ?? '',
    departmentId: idStr(raw.department_id),
    ownerId: raw.owner_id != null ? idStr(raw.owner_id) : null,
    memberIds: (raw.member_ids ?? []).map(idStr),
    startDate: raw.start_date ?? null,
    dueDate: raw.due_date ?? null,
    status: raw.status ?? 'active',
    nextSequence: Number(raw.next_sequence ?? 1),
    workflowId: raw.workflow_id ?? null,
    createdAt: raw.created_at ?? '',
    updatedAt: raw.updated_at ?? '',
  };
}

export function mapWorkItem(raw: any): WorkItem {
  const estimate = raw.estimate ?? {};
  const bug = raw.bug;
  return {
    id: idStr(raw.id),
    key: raw.key ?? '',
    title: raw.title ?? '',
    description: raw.description ?? '',
    type: raw.type ?? 'task',
    status: raw.status ?? 'new',
    priority: raw.priority ?? 'medium',
    projectId: idStr(raw.project_id),
    departmentId: idStr(raw.department_id),
    reporterId: idStr(raw.reporter_id),
    assigneeId: raw.assignee_id != null ? idStr(raw.assignee_id) : null,
    createdById: idStr(raw.created_by_id),
    dueDate: raw.due_date ?? null,
    estimate: {
      originalHours: Number(estimate.original_hours ?? 0),
      remainingHours: Number(estimate.remaining_hours ?? 0),
      completedHours: Number(estimate.completed_hours ?? 0),
    },
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    parentId: raw.parent_id != null ? idStr(raw.parent_id) : null,
    bug: bug
      ? {
          stepsToReproduce: bug.steps_to_reproduce,
          expectedResult: bug.expected_result,
          actualResult: bug.actual_result,
          environment: bug.environment,
          severity: bug.severity,
        }
      : undefined,
    createdAt: raw.created_at ?? '',
    updatedAt: raw.updated_at ?? '',
  };
}

export function mapComment(raw: any): Comment {
  return {
    id: idStr(raw.id),
    workItemId: idStr(raw.work_item_id),
    authorId: idStr(raw.author_id),
    body: raw.body ?? '',
    mentionIds: (raw.mention_ids ?? []).map(idStr),
    createdAt: raw.created_at ?? '',
    updatedAt: raw.updated_at ?? '',
    deletedAt: raw.deleted_at ?? null,
  };
}

export function mapAttachment(raw: any): Attachment {
  const original = raw.original ?? raw.data_url ?? '';
  return {
    id: idStr(raw.id),
    workItemId: idStr(raw.work_item_id),
    name: raw.name ?? '',
    mimeType: raw.mime_type ?? 'application/octet-stream',
    size: Number(raw.size ?? 0),
    dataUrl: original,
    original: original || undefined,
    thumbnail: raw.thumbnail ?? undefined,
    serverId: raw.server_attachment_id ?? undefined,
    uploadedById: idStr(raw.uploaded_by_id),
    createdAt: raw.created_at ?? '',
  };
}

export function mapActivity(raw: any): ActivityEntry {
  return {
    id: idStr(raw.id),
    workItemId: idStr(raw.work_item_id),
    action: raw.action,
    actorId: idStr(raw.actor_id),
    message: raw.message ?? '',
    meta: raw.meta ?? undefined,
    createdAt: raw.created_at ?? '',
  };
}

export function mapWorkLog(raw: any): WorkLog {
  return {
    id: idStr(raw.id),
    workItemId: idStr(raw.work_item_id),
    userId: idStr(raw.user_id),
    hours: Number(raw.hours ?? 0),
    date: raw.date ?? '',
    description: raw.description ?? '',
    createdAt: raw.created_at ?? '',
  };
}

export function mapLink(raw: any): WorkItemLink {
  return {
    id: idStr(raw.id),
    sourceId: idStr(raw.source_id),
    targetId: idStr(raw.target_id),
    type: raw.type,
    createdById: idStr(raw.created_by_id),
    createdAt: raw.created_at ?? '',
  };
}

export function mapSavedView(raw: any): SavedView {
  return {
    id: idStr(raw.id),
    userId: idStr(raw.user_id),
    name: raw.name ?? '',
    filters: mapFiltersFromApi(raw.filters ?? {}),
    createdAt: raw.created_at ?? '',
    updatedAt: raw.updated_at ?? '',
  };
}

export function mapNotification(raw: any): WmNotification {
  return {
    id: idStr(raw.id),
    userId: idStr(raw.user_id),
    type: raw.type,
    title: raw.title ?? '',
    body: raw.body ?? '',
    workItemId: raw.work_item_id != null ? idStr(raw.work_item_id) : undefined,
    read: !!raw.read_at,
    createdAt: raw.created_at ?? '',
  };
}

export function mapWorkflow(raw: any): WorkflowDefinition {
  return {
    id: String(raw.id),
    name: raw.name ?? '',
    statuses: raw.statuses ?? [],
    transitions: raw.transitions ?? {},
  };
}

export function mapDashboardKpis(raw: any): DashboardKpis {
  return {
    openWork: Number(raw.open_work ?? 0),
    inProgress: Number(raw.in_progress ?? 0),
    readyToTest: Number(raw.ready_to_test ?? 0),
    overdue: Number(raw.overdue ?? 0),
    criticalBugs: Number(raw.critical_bugs ?? 0),
    completedThisWeek: Number(raw.completed_this_week ?? 0),
    byStatus: (raw.by_status ?? []).map((r: any) => ({
      status: r.status,
      count: Number(r.count ?? 0),
    })),
    bySeverity: (raw.by_severity ?? []).map((r: any) => ({
      severity: r.severity,
      count: Number(r.count ?? 0),
    })),
    byDepartment: (raw.by_department ?? []).map((r: any) => ({
      departmentId: idStr(r.department_id),
      name: r.name ?? '',
      count: Number(r.count ?? 0),
    })),
    byAssignee: (raw.by_assignee ?? []).map((r: any) => ({
      userId: idStr(r.user_id),
      name: r.name ?? '',
      count: Number(r.count ?? 0),
    })),
    completedTrend: (raw.completed_trend ?? []).map((r: any) => ({
      date: r.date,
      count: Number(r.count ?? 0),
    })),
  };
}

export function mapUser(raw: any): WmUser {
  const name =
    typeof raw.name === 'string'
      ? raw.name
      : raw.name?.en || raw.name?.ar || raw.email || idStr(raw.id);
  return {
    id: idStr(raw.id ?? raw.user_id),
    name,
    email: raw.email ?? '',
    active: raw.active !== false && raw.status !== 'inactive',
  };
}

export function departmentToApi(
  input: CreateDepartmentInput | Omit<UpdateDepartmentInput, 'id'>
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if ('name' in input && input.name !== undefined) body.name = input.name;
  if ('description' in input && input.description !== undefined)
    body.description = input.description;
  if ('managerId' in input && input.managerId !== undefined)
    body.manager_id = idNum(input.managerId);
  if ('memberIds' in input && input.memberIds !== undefined)
    body.member_ids = input.memberIds.map((id) => idNum(id)).filter((n) => n != null);
  if ('status' in input && input.status !== undefined) body.status = input.status;
  if ('workflowId' in input && input.workflowId !== undefined)
    body.workflow_id = input.workflowId;
  return body;
}

export function projectToApi(
  input: CreateProjectInput | Omit<UpdateProjectInput, 'id'>
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if ('key' in input && input.key !== undefined) body.key = input.key;
  if ('name' in input && input.name !== undefined) body.name = input.name;
  if ('description' in input && input.description !== undefined)
    body.description = input.description;
  if ('departmentId' in input && input.departmentId !== undefined)
    body.department_id = idNum(input.departmentId);
  if ('ownerId' in input && input.ownerId !== undefined)
    body.owner_id = idNum(input.ownerId);
  if ('memberIds' in input && input.memberIds !== undefined)
    body.member_ids = input.memberIds.map((id) => idNum(id)).filter((n) => n != null);
  if ('startDate' in input && input.startDate !== undefined)
    body.start_date = input.startDate ? String(input.startDate).slice(0, 10) : null;
  if ('dueDate' in input && input.dueDate !== undefined)
    body.due_date = input.dueDate ? String(input.dueDate).slice(0, 10) : null;
  if ('status' in input && input.status !== undefined) body.status = input.status;
  if ('workflowId' in input && input.workflowId !== undefined)
    body.workflow_id = input.workflowId;
  return body;
}

export function workItemCreateToApi(input: CreateWorkItemInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    title: input.title,
    description: input.description ?? '',
    type: input.type,
    priority: input.priority ?? 'medium',
    project_id: idNum(input.projectId),
    assignee_id: idNum(input.assigneeId ?? null),
    due_date: input.dueDate ? String(input.dueDate).slice(0, 10) : null,
    tags: input.tags ?? [],
    parent_id: idNum(input.parentId ?? null),
    estimate: {
      original_hours: input.estimate?.originalHours ?? 0,
      remaining_hours:
        input.estimate?.remainingHours ?? input.estimate?.originalHours ?? 0,
      completed_hours: input.estimate?.completedHours ?? 0,
    },
  };
  if (input.type === 'bug' && input.bug) {
    body.bug = {
      steps_to_reproduce: input.bug.stepsToReproduce,
      expected_result: input.bug.expectedResult,
      actual_result: input.bug.actualResult,
      environment: input.bug.environment,
      severity: input.bug.severity,
    };
  }
  return body;
}

export function workItemUpdateToApi(
  input: Omit<UpdateWorkItemInput, 'id'>
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.title !== undefined) body.title = input.title;
  if (input.description !== undefined) body.description = input.description;
  if (input.type !== undefined) body.type = input.type;
  if (input.priority !== undefined) body.priority = input.priority;
  if (input.dueDate !== undefined)
    body.due_date = input.dueDate ? String(input.dueDate).slice(0, 10) : null;
  if (input.tags !== undefined) body.tags = input.tags;
  if (input.parentId !== undefined) body.parent_id = idNum(input.parentId);
  if (input.estimate !== undefined) {
    body.estimate = {
      original_hours: input.estimate.originalHours,
      remaining_hours: input.estimate.remainingHours,
      completed_hours: input.estimate.completedHours,
    };
  }
  if (input.bug !== undefined) {
    body.bug = {
      steps_to_reproduce: input.bug.stepsToReproduce,
      expected_result: input.bug.expectedResult,
      actual_result: input.bug.actualResult,
      environment: input.bug.environment,
      severity: input.bug.severity,
    };
  }
  return body;
}

export function filtersToQuery(
  filters?: WorkItemFilters
): Record<string, string | number | string[]> {
  if (!filters) return { limit: 100 };
  const q: Record<string, string | number | string[]> = { limit: 100 };
  if (filters.q) q.q = filters.q;
  if (filters.projectId) q.project_id = Number(filters.projectId);
  if (filters.departmentId) q.department_id = Number(filters.departmentId);
  if (filters.type) q.type = filters.type;
  if (filters.status) q.status = filters.status;
  if (filters.priority) q.priority = filters.priority;
  if (filters.assigneeId) q.assignee_id = Number(filters.assigneeId);
  if (filters.reporterId) q.reporter_id = Number(filters.reporterId);
  if (filters.myWorkUserId) q.my_work = 1;
  if (filters.unassigned) q.unassigned = 1;
  if (filters.overdue) q.overdue = 1;
  if (filters.dueFrom) q.due_from = String(filters.dueFrom).slice(0, 10);
  if (filters.dueTo) q.due_to = String(filters.dueTo).slice(0, 10);
  if (filters.createdFrom) q.created_from = String(filters.createdFrom).slice(0, 10);
  if (filters.createdTo) q.created_to = String(filters.createdTo).slice(0, 10);
  if (filters.parentId) q.parent_id = Number(filters.parentId);
  if (filters.tags?.length) q.tags = filters.tags;
  return q;
}

function mapFiltersFromApi(raw: Record<string, unknown>): WorkItemFilters {
  return {
    q: (raw.q as string) ?? '',
    projectId: raw.project_id != null ? idStr(raw.project_id as any) : undefined,
    departmentId:
      raw.department_id != null ? idStr(raw.department_id as any) : undefined,
    type: (raw.type as any) ?? '',
    status: (raw.status as string) ?? '',
    priority: (raw.priority as any) ?? '',
    assigneeId: raw.assignee_id != null ? idStr(raw.assignee_id as any) : undefined,
    reporterId: raw.reporter_id != null ? idStr(raw.reporter_id as any) : undefined,
    overdue: raw.overdue === 1 || raw.overdue === true || undefined,
    unassigned: raw.unassigned === 1 || raw.unassigned === true || undefined,
    dueFrom: (raw.due_from as string) || undefined,
    dueTo: (raw.due_to as string) || undefined,
  };
}

export function filtersToApiPayload(filters: WorkItemFilters): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (filters.q) out.q = filters.q;
  if (filters.projectId) out.project_id = Number(filters.projectId);
  if (filters.departmentId) out.department_id = Number(filters.departmentId);
  if (filters.type) out.type = filters.type;
  if (filters.status) out.status = filters.status;
  if (filters.priority) out.priority = filters.priority;
  if (filters.assigneeId) out.assignee_id = Number(filters.assigneeId);
  if (filters.reporterId) out.reporter_id = Number(filters.reporterId);
  if (filters.overdue) out.overdue = 1;
  if (filters.unassigned) out.unassigned = 1;
  if (filters.dueFrom) out.due_from = String(filters.dueFrom).slice(0, 10);
  if (filters.dueTo) out.due_to = String(filters.dueTo).slice(0, 10);
  return out;
}
