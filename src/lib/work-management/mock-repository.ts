import type {
  ActivityAction,
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
  WorkItemLinkType,
  WorkItemStatus,
  WorkLog,
  WorkflowDefinition,
} from '@/types/work-management';
import type { WorkManagementRepository } from './repository';
import {
  loadStore,
  saveStore,
  resetStore,
  uid,
  type WorkManagementStore,
} from './mock-store';
import { canTransition, DEFAULT_WORKFLOW } from './workflow';

function nowIso() {
  return new Date().toISOString();
}

function userName(store: WorkManagementStore, id: string | null | undefined) {
  if (!id) return 'Unassigned';
  return store.users.find((u) => u.id === id)?.name ?? id;
}

function pushActivity(
  store: WorkManagementStore,
  workItemId: string,
  action: ActivityAction,
  actorId: string,
  message: string,
  meta?: Record<string, unknown>
) {
  const entry: ActivityEntry = {
    id: uid('act'),
    workItemId,
    action,
    actorId,
    message,
    meta,
    createdAt: nowIso(),
  };
  store.activities.unshift(entry);
  return entry;
}

function pushNotification(
  store: WorkManagementStore,
  userId: string,
  type: WmNotification['type'],
  title: string,
  body: string,
  workItemId?: string
) {
  if (!userId) return;
  store.notifications.unshift({
    id: uid('n'),
    userId,
    type,
    title,
    body,
    workItemId,
    read: false,
    createdAt: nowIso(),
  });
}

function parseMentions(body: string, users: WmUser[]): string[] {
  const names = body.match(/@([A-Za-z][A-Za-z\s]*)/g) ?? [];
  const ids: string[] = [];
  for (const raw of names) {
    const name = raw.slice(1).trim().toLowerCase();
    const match = users.find(
      (u) =>
        u.name.toLowerCase() === name ||
        u.name.toLowerCase().startsWith(name) ||
        u.name.split(' ')[0].toLowerCase() === name
    );
    if (match && !ids.includes(match.id)) ids.push(match.id);
  }
  return ids;
}

function matchesFilters(item: WorkItem, filters?: WorkItemFilters): boolean {
  if (!filters) return true;
  if (filters.q) {
    const q = filters.q.toLowerCase();
    const hay = `${item.key} ${item.title} ${item.description} ${item.tags.join(' ')}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (filters.id && item.key.toLowerCase() !== filters.id.toLowerCase() && item.id !== filters.id)
    return false;
  if (filters.projectId && item.projectId !== filters.projectId) return false;
  if (filters.departmentId && item.departmentId !== filters.departmentId) return false;
  if (filters.type && item.type !== filters.type) return false;
  if (filters.status && item.status !== filters.status) return false;
  if (filters.priority && item.priority !== filters.priority) return false;
  if (filters.assigneeId && item.assigneeId !== filters.assigneeId) return false;
  if (filters.reporterId && item.reporterId !== filters.reporterId) return false;
  if (filters.myWorkUserId && item.assigneeId !== filters.myWorkUserId) return false;
  if (filters.unassigned && item.assigneeId) return false;
  if (filters.parentId !== undefined) {
    if (filters.parentId === null && item.parentId) return false;
    if (filters.parentId && item.parentId !== filters.parentId) return false;
  }
  if (filters.tags?.length) {
    if (!filters.tags.every((t) => item.tags.includes(t))) return false;
  }
  if (filters.createdFrom && item.createdAt < filters.createdFrom) return false;
  if (filters.createdTo && item.createdAt > filters.createdTo) return false;
  if (filters.dueFrom && (!item.dueDate || item.dueDate < filters.dueFrom)) return false;
  if (filters.dueTo && (!item.dueDate || item.dueDate > filters.dueTo)) return false;
  if (filters.overdue) {
    if (!item.dueDate || item.status === 'done' || item.status === 'cancelled') return false;
    if (new Date(item.dueDate) >= new Date()) return false;
  }
  return true;
}

function resolveWorkflow(
  store: WorkManagementStore,
  project: Project | undefined
): WorkflowDefinition {
  const id = project?.workflowId;
  if (id) {
    const wf = store.workflows.find((w) => w.id === id);
    if (wf) return wf;
  }
  const dept = store.departments.find((d) => d.id === project?.departmentId);
  if (dept?.workflowId) {
    const wf = store.workflows.find((w) => w.id === dept.workflowId);
    if (wf) return wf;
  }
  return store.workflows.find((w) => w.id === DEFAULT_WORKFLOW.id) ?? DEFAULT_WORKFLOW;
}

function assertAssignable(
  store: WorkManagementStore,
  project: Project,
  department: Department,
  assigneeId: string | null
) {
  if (!assigneeId) return;
  const allowed = new Set([
    ...project.memberIds,
    ...department.memberIds,
    project.ownerId,
    department.managerId,
  ].filter(Boolean) as string[]);
  if (!allowed.has(assigneeId)) {
    throw new Error('Assignee must be a project or department member');
  }
}

export class MockWorkManagementRepository implements WorkManagementRepository {
  private withStore<T>(fn: (store: WorkManagementStore) => T): T {
    const store = loadStore();
    const result = fn(store);
    saveStore(store);
    return result;
  }

  async listUsers() {
    return loadStore().users;
  }

  async getUser(id: string) {
    return loadStore().users.find((u) => u.id === id) ?? null;
  }

  async listDepartments() {
    return loadStore().departments;
  }

  async getDepartment(id: string) {
    return loadStore().departments.find((d) => d.id === id) ?? null;
  }

  async createDepartment(input: CreateDepartmentInput) {
    return this.withStore((store) => {
      const dept: Department = {
        id: uid('dept'),
        name: input.name.trim(),
        description: input.description?.trim() ?? '',
        managerId: input.managerId ?? null,
        memberIds: input.memberIds ?? [],
        status: 'active',
        workflowId: DEFAULT_WORKFLOW.id,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      store.departments.unshift(dept);
      return dept;
    });
  }

  async updateDepartment(input: UpdateDepartmentInput) {
    return this.withStore((store) => {
      const dept = store.departments.find((d) => d.id === input.id);
      if (!dept) throw new Error('Department not found');
      if (input.name !== undefined) dept.name = input.name.trim();
      if (input.description !== undefined) dept.description = input.description;
      if (input.managerId !== undefined) dept.managerId = input.managerId;
      if (input.memberIds !== undefined) dept.memberIds = input.memberIds;
      if (input.status !== undefined) dept.status = input.status;
      dept.updatedAt = nowIso();
      return { ...dept };
    });
  }

  async archiveDepartment(id: string) {
    return this.updateDepartment({ id, status: 'archived' });
  }

  async listProjects(departmentId?: string) {
    const projects = loadStore().projects;
    return departmentId
      ? projects.filter((p) => p.departmentId === departmentId)
      : projects;
  }

  async getProject(id: string) {
    return loadStore().projects.find((p) => p.id === id) ?? null;
  }

  async createProject(input: CreateProjectInput) {
    return this.withStore((store) => {
      const key = input.key.trim().toUpperCase();
      if (!/^[A-Z][A-Z0-9]{1,9}$/.test(key)) {
        throw new Error('Project key must be 2–10 uppercase letters/numbers');
      }
      if (store.projects.some((p) => p.key === key)) {
        throw new Error(`Project key ${key} already exists`);
      }
      const dept = store.departments.find((d) => d.id === input.departmentId);
      if (!dept) throw new Error('Department not found');
      if (dept.status === 'archived') {
        throw new Error('Archived departments cannot receive new projects');
      }
      const project: Project = {
        id: uid('proj'),
        key,
        name: input.name.trim(),
        description: input.description?.trim() ?? '',
        departmentId: input.departmentId,
        ownerId: input.ownerId ?? null,
        memberIds: input.memberIds ?? [],
        startDate: input.startDate ?? null,
        dueDate: input.dueDate ?? null,
        status: input.status ?? 'active',
        nextSequence: 1,
        workflowId: input.workflowId ?? dept.workflowId ?? DEFAULT_WORKFLOW.id,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      store.projects.unshift(project);
      return project;
    });
  }

  async updateProject(input: UpdateProjectInput) {
    return this.withStore((store) => {
      const project = store.projects.find((p) => p.id === input.id);
      if (!project) throw new Error('Project not found');
      if (input.key !== undefined) {
        const key = input.key.trim().toUpperCase();
        if (store.projects.some((p) => p.key === key && p.id !== project.id)) {
          throw new Error(`Project key ${key} already exists`);
        }
        project.key = key;
      }
      if (input.name !== undefined) project.name = input.name.trim();
      if (input.description !== undefined) project.description = input.description;
      if (input.departmentId !== undefined) project.departmentId = input.departmentId;
      if (input.ownerId !== undefined) project.ownerId = input.ownerId;
      if (input.memberIds !== undefined) project.memberIds = input.memberIds;
      if (input.startDate !== undefined) project.startDate = input.startDate;
      if (input.dueDate !== undefined) project.dueDate = input.dueDate;
      if (input.status !== undefined) project.status = input.status;
      if (input.workflowId !== undefined) project.workflowId = input.workflowId;
      project.updatedAt = nowIso();
      return { ...project };
    });
  }

  async listWorkItems(filters?: WorkItemFilters) {
    return loadStore()
      .workItems.filter((w) => matchesFilters(w, filters))
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }

  async getWorkItem(idOrKey: string) {
    const store = loadStore();
    return (
      store.workItems.find(
        (w) => w.id === idOrKey || w.key.toLowerCase() === idOrKey.toLowerCase()
      ) ?? null
    );
  }

  async createWorkItem(input: CreateWorkItemInput) {
    return this.withStore((store) => {
      const project = store.projects.find((p) => p.id === input.projectId);
      if (!project) throw new Error('Project not found');
      if (project.status === 'archived') {
        throw new Error('Cannot create work in archived project');
      }
      const department = store.departments.find((d) => d.id === project.departmentId);
      if (!department) throw new Error('Department not found');
      if (department.status === 'archived') {
        throw new Error('Archived departments cannot receive new work');
      }
      if (input.assigneeId) {
        assertAssignable(store, project, department, input.assigneeId);
      }
      const seq = project.nextSequence;
      project.nextSequence += 1;
      project.updatedAt = nowIso();
      const item: WorkItem = {
        id: uid('wi'),
        key: `${project.key}-${seq}`,
        title: input.title.trim(),
        description: input.description?.trim() ?? '',
        type: input.type,
        status: 'new',
        priority: input.priority ?? 'medium',
        projectId: project.id,
        departmentId: department.id,
        reporterId: input.reporterId,
        assigneeId: input.assigneeId ?? null,
        createdById: input.createdById,
        dueDate: input.dueDate ?? null,
        estimate: {
          originalHours: input.estimate?.originalHours ?? 0,
          remainingHours:
            input.estimate?.remainingHours ?? input.estimate?.originalHours ?? 0,
          completedHours: input.estimate?.completedHours ?? 0,
        },
        tags: input.tags ?? [],
        parentId: input.parentId ?? null,
        bug: input.type === 'bug' ? input.bug ?? {} : undefined,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      store.workItems.unshift(item);
      const actor = userName(store, input.createdById);
      pushActivity(
        store,
        item.id,
        'created',
        input.createdById,
        `${actor} created ${item.key}`
      );
      if (item.assigneeId) {
        store.assignmentHistory.push({
          id: uid('ah'),
          workItemId: item.id,
          fromAssigneeId: null,
          toAssigneeId: item.assigneeId,
          changedById: input.createdById,
          changedAt: nowIso(),
        });
        pushActivity(
          store,
          item.id,
          'assigned',
          input.createdById,
          `${actor} assigned ${item.key} to ${userName(store, item.assigneeId)}`,
          { toAssigneeId: item.assigneeId }
        );
        pushNotification(
          store,
          item.assigneeId,
          'assigned',
          `Assigned ${item.key}`,
          `You were assigned ${item.key} — ${item.title}`,
          item.id
        );
      }
      return item;
    });
  }

  async updateWorkItem(input: UpdateWorkItemInput) {
    return this.withStore((store) => {
      const item = store.workItems.find((w) => w.id === input.id);
      if (!item) throw new Error('Work item not found');
      const actor = userName(store, input.actorId);
      if (input.title !== undefined) item.title = input.title.trim();
      if (input.description !== undefined) item.description = input.description;
      if (input.type !== undefined) item.type = input.type;
      if (input.priority !== undefined && input.priority !== item.priority) {
        const from = item.priority;
        item.priority = input.priority;
        pushActivity(
          store,
          item.id,
          'priority_changed',
          input.actorId,
          `${actor} changed priority ${from} → ${input.priority}`,
          { from, to: input.priority }
        );
      }
      if (input.dueDate !== undefined) item.dueDate = input.dueDate;
      if (input.tags !== undefined) item.tags = input.tags;
      if (input.parentId !== undefined) {
        item.parentId = input.parentId;
        pushActivity(
          store,
          item.id,
          'parent_changed',
          input.actorId,
          `${actor} updated parent relationship`,
          { parentId: input.parentId }
        );
      }
      if (input.estimate !== undefined) {
        item.estimate = { ...item.estimate, ...input.estimate };
        pushActivity(
          store,
          item.id,
          'estimate_updated',
          input.actorId,
          `${actor} updated estimate`,
          { estimate: item.estimate }
        );
      }
      if (input.bug !== undefined) item.bug = { ...item.bug, ...input.bug };
      item.updatedAt = nowIso();
      pushActivity(
        store,
        item.id,
        'updated',
        input.actorId,
        `${actor} updated ${item.key}`
      );
      return { ...item };
    });
  }

  async deleteWorkItem(id: string, actorId: string) {
    this.withStore((store) => {
      const idx = store.workItems.findIndex((w) => w.id === id);
      if (idx < 0) throw new Error('Work item not found');
      const item = store.workItems[idx];
      store.workItems.splice(idx, 1);
      pushActivity(
        store,
        id,
        'updated',
        actorId,
        `${userName(store, actorId)} deleted ${item.key}`
      );
    });
  }

  async assignWorkItem(
    workItemId: string,
    assigneeId: string | null,
    actorId: string
  ) {
    return this.withStore((store) => {
      const item = store.workItems.find((w) => w.id === workItemId);
      if (!item) throw new Error('Work item not found');
      const project = store.projects.find((p) => p.id === item.projectId);
      const department = store.departments.find((d) => d.id === item.departmentId);
      if (!project || !department) throw new Error('Project or department missing');
      assertAssignable(store, project, department, assigneeId);
      const from = item.assigneeId;
      item.assigneeId = assigneeId;
      item.updatedAt = nowIso();
      store.assignmentHistory.push({
        id: uid('ah'),
        workItemId: item.id,
        fromAssigneeId: from,
        toAssigneeId: assigneeId,
        changedById: actorId,
        changedAt: nowIso(),
      });
      const actor = userName(store, actorId);
      if (assigneeId) {
        pushActivity(
          store,
          item.id,
          'assigned',
          actorId,
          `${actor} assigned ${item.key} to ${userName(store, assigneeId)}`,
          { fromAssigneeId: from, toAssigneeId: assigneeId }
        );
        pushNotification(
          store,
          assigneeId,
          'assigned',
          `Assigned ${item.key}`,
          `You were assigned ${item.key} — ${item.title}`,
          item.id
        );
      } else {
        pushActivity(
          store,
          item.id,
          'unassigned',
          actorId,
          `${actor} unassigned ${item.key}`,
          { fromAssigneeId: from }
        );
      }
      return { ...item };
    });
  }

  async transitionStatus(
    workItemId: string,
    toStatus: WorkItemStatus,
    actorId: string
  ) {
    return this.withStore((store) => {
      const item = store.workItems.find((w) => w.id === workItemId);
      if (!item) throw new Error('Work item not found');
      const project = store.projects.find((p) => p.id === item.projectId);
      const workflow = resolveWorkflow(store, project);
      if (!canTransition(workflow, item.status, toStatus)) {
        throw new Error(
          `Transition ${item.status} → ${toStatus} is not allowed for workflow ${workflow.name}`
        );
      }
      const from = item.status;
      item.status = toStatus;
      item.updatedAt = nowIso();
      store.statusHistory.push({
        id: uid('sh'),
        workItemId: item.id,
        fromStatus: from,
        toStatus,
        changedById: actorId,
        changedAt: nowIso(),
      });
      const actor = userName(store, actorId);
      const action: ActivityAction =
        toStatus === 'reopened' ? 'reopened' : 'status_changed';
      pushActivity(
        store,
        item.id,
        action,
        actorId,
        `${actor} changed ${from} → ${toStatus}`,
        { fromStatus: from, toStatus }
      );
      // Notify assignee / reporter on status change & reopen
      const notifyIds = [item.assigneeId, item.reporterId].filter(
        (id): id is string => !!id && id !== actorId
      );
      Array.from(new Set(notifyIds)).forEach((uidNotify) => {
        pushNotification(
          store,
          uidNotify,
          toStatus === 'reopened' ? 'reopened' : 'status_changed',
          `${item.key} status updated`,
          `${actor} changed ${item.key}: ${from} → ${toStatus}`,
          item.id
        );
      });
      return { ...item };
    });
  }

  async listComments(workItemId: string) {
    return loadStore()
      .comments.filter((c) => c.workItemId === workItemId && !c.deletedAt)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async addComment(workItemId: string, authorId: string, body: string) {
    return this.withStore((store) => {
      const item = store.workItems.find((w) => w.id === workItemId);
      if (!item) throw new Error('Work item not found');
      const mentionIds = parseMentions(body, store.users);
      const comment: Comment = {
        id: uid('c'),
        workItemId,
        authorId,
        body: body.trim(),
        mentionIds,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        deletedAt: null,
      };
      store.comments.unshift(comment);
      const actor = userName(store, authorId);
      pushActivity(
        store,
        workItemId,
        'comment_added',
        authorId,
        `${actor} added a comment`
      );
      for (const mid of mentionIds) {
        pushNotification(
          store,
          mid,
          'mentioned',
          `Mentioned on ${item.key}`,
          `${actor} mentioned you on ${item.key}`,
          item.id
        );
      }
      if (item.assigneeId && item.assigneeId !== authorId) {
        pushNotification(
          store,
          item.assigneeId,
          'commented',
          `New comment on ${item.key}`,
          `${actor} commented on ${item.key}`,
          item.id
        );
      }
      return comment;
    });
  }

  async editComment(commentId: string, authorId: string, body: string) {
    return this.withStore((store) => {
      const comment = store.comments.find((c) => c.id === commentId);
      if (!comment || comment.deletedAt) throw new Error('Comment not found');
      if (comment.authorId !== authorId) {
        throw new Error('You can only edit your own comments');
      }
      comment.body = body.trim();
      comment.mentionIds = parseMentions(body, store.users);
      comment.updatedAt = nowIso();
      pushActivity(
        store,
        comment.workItemId,
        'comment_edited',
        authorId,
        `${userName(store, authorId)} edited a comment`
      );
      return { ...comment };
    });
  }

  async deleteComment(commentId: string, authorId: string) {
    this.withStore((store) => {
      const comment = store.comments.find((c) => c.id === commentId);
      if (!comment || comment.deletedAt) throw new Error('Comment not found');
      if (comment.authorId !== authorId) {
        throw new Error('You can only delete your own comments');
      }
      comment.deletedAt = nowIso();
      pushActivity(
        store,
        comment.workItemId,
        'comment_deleted',
        authorId,
        `${userName(store, authorId)} deleted a comment`
      );
    });
  }

  async listAttachments(workItemId: string) {
    return loadStore().attachments.filter((a) => a.workItemId === workItemId);
  }

  async addAttachment(
    workItemId: string,
    file: {
      name: string;
      mimeType: string;
      size: number;
      dataUrl: string;
      original?: string;
      thumbnail?: string;
      serverId?: string | number;
    },
    uploadedById: string
  ) {
    return this.withStore((store) => {
      const item = store.workItems.find((w) => w.id === workItemId);
      if (!item) throw new Error('Work item not found');
      const attachment: Attachment = {
        id: uid('att'),
        workItemId,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
        dataUrl: file.dataUrl || file.original || file.thumbnail || '',
        original: file.original,
        thumbnail: file.thumbnail,
        serverId: file.serverId,
        uploadedById,
        createdAt: nowIso(),
      };
      store.attachments.unshift(attachment);
      pushActivity(
        store,
        workItemId,
        'attachment_added',
        uploadedById,
        `${userName(store, uploadedById)} added attachment ${file.name}`
      );
      return attachment;
    });
  }

  async removeAttachment(attachmentId: string, actorId: string) {
    this.withStore((store) => {
      const idx = store.attachments.findIndex((a) => a.id === attachmentId);
      if (idx < 0) throw new Error('Attachment not found');
      const [att] = store.attachments.splice(idx, 1);
      pushActivity(
        store,
        att.workItemId,
        'attachment_removed',
        actorId,
        `${userName(store, actorId)} removed attachment ${att.name}`
      );
    });
  }

  async listActivities(workItemId: string) {
    return loadStore()
      .activities.filter((a) => a.workItemId === workItemId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async listWorkLogs(workItemId: string) {
    return loadStore()
      .workLogs.filter((w) => w.workItemId === workItemId)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  async addWorkLog(
    workItemId: string,
    userId: string,
    hours: number,
    date: string,
    description: string
  ) {
    return this.withStore((store) => {
      const item = store.workItems.find((w) => w.id === workItemId);
      if (!item) throw new Error('Work item not found');
      if (hours <= 0) throw new Error('Hours must be positive');
      const log: WorkLog = {
        id: uid('wl'),
        workItemId,
        userId,
        hours,
        date,
        description: description.trim(),
        createdAt: nowIso(),
      };
      store.workLogs.unshift(log);
      item.estimate.completedHours += hours;
      item.estimate.remainingHours = Math.max(
        0,
        item.estimate.remainingHours - hours
      );
      item.updatedAt = nowIso();
      pushActivity(
        store,
        workItemId,
        'work_logged',
        userId,
        `${userName(store, userId)} logged ${hours}h`,
        { hours, date }
      );
      return log;
    });
  }

  async listLinks(workItemId: string) {
    return loadStore().links.filter(
      (l) => l.sourceId === workItemId || l.targetId === workItemId
    );
  }

  async addLink(
    sourceId: string,
    targetId: string,
    type: WorkItemLinkType,
    actorId: string
  ) {
    return this.withStore((store) => {
      if (sourceId === targetId) throw new Error('Cannot link an item to itself');
      const source = store.workItems.find((w) => w.id === sourceId);
      const target = store.workItems.find((w) => w.id === targetId);
      if (!source || !target) throw new Error('Work item not found');
      const link: WorkItemLink = {
        id: uid('lnk'),
        sourceId,
        targetId,
        type,
        createdById: actorId,
        createdAt: nowIso(),
      };
      store.links.push(link);
      // Inverse for blocks/blocked_by
      if (type === 'blocks') {
        store.links.push({
          id: uid('lnk'),
          sourceId: targetId,
          targetId: sourceId,
          type: 'blocked_by',
          createdById: actorId,
          createdAt: nowIso(),
        });
      } else if (type === 'blocked_by') {
        store.links.push({
          id: uid('lnk'),
          sourceId: targetId,
          targetId: sourceId,
          type: 'blocks',
          createdById: actorId,
          createdAt: nowIso(),
        });
      }
      pushActivity(
        store,
        sourceId,
        'link_added',
        actorId,
        `${userName(store, actorId)} linked ${source.key} (${type}) ${target.key}`
      );
      return link;
    });
  }

  async removeLink(linkId: string, actorId: string) {
    this.withStore((store) => {
      const link = store.links.find((l) => l.id === linkId);
      if (!link) throw new Error('Link not found');
      store.links = store.links.filter((l) => {
        if (l.id === linkId) return false;
        // remove inverse pair
        if (
          (l.sourceId === link.targetId &&
            l.targetId === link.sourceId &&
            ((link.type === 'blocks' && l.type === 'blocked_by') ||
              (link.type === 'blocked_by' && l.type === 'blocks')))
        ) {
          return false;
        }
        return true;
      });
      pushActivity(
        store,
        link.sourceId,
        'link_removed',
        actorId,
        `${userName(store, actorId)} removed a link`
      );
    });
  }

  async listChildren(parentId: string) {
    return loadStore().workItems.filter((w) => w.parentId === parentId);
  }

  async listSavedViews(userId: string) {
    return loadStore().savedViews.filter((v) => v.userId === userId);
  }

  async saveView(userId: string, name: string, filters: WorkItemFilters) {
    return this.withStore((store) => {
      const view: SavedView = {
        id: uid('sv'),
        userId,
        name: name.trim(),
        filters,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      store.savedViews.unshift(view);
      return view;
    });
  }

  async deleteSavedView(id: string, userId: string) {
    this.withStore((store) => {
      const view = store.savedViews.find((v) => v.id === id);
      if (!view || view.userId !== userId) throw new Error('Saved view not found');
      store.savedViews = store.savedViews.filter((v) => v.id !== id);
    });
  }

  async listNotifications(userId: string) {
    return loadStore()
      .notifications.filter((n) => n.userId === userId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async markNotificationRead(id: string, userId: string) {
    this.withStore((store) => {
      const n = store.notifications.find((x) => x.id === id && x.userId === userId);
      if (n) n.read = true;
    });
  }

  async markAllNotificationsRead(userId: string) {
    this.withStore((store) => {
      store.notifications
        .filter((n) => n.userId === userId)
        .forEach((n) => {
          n.read = true;
        });
    });
  }

  async listWorkflows() {
    return loadStore().workflows;
  }

  async getWorkflow(id: string) {
    return loadStore().workflows.find((w) => w.id === id) ?? null;
  }

  async getWorkflowForProject(projectId: string) {
    const store = loadStore();
    const project = store.projects.find((p) => p.id === projectId);
    return resolveWorkflow(store, project);
  }

  async upsertWorkflow(workflow: WorkflowDefinition) {
    return this.withStore((store) => {
      const idx = store.workflows.findIndex((w) => w.id === workflow.id);
      if (idx >= 0) store.workflows[idx] = workflow;
      else store.workflows.push(workflow);
      return workflow;
    });
  }

  async getDashboardKpis(): Promise<DashboardKpis> {
    const store = loadStore();
    const items = store.workItems;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const openStatuses = new Set([
      'new',
      'in_progress',
      'ready_to_test',
      'testing',
      'blocked',
      'reopened',
      'open',
      'investigating',
      'waiting_customer',
      'under_review',
      'approved',
    ]);

    const byStatusMap = new Map<string, number>();
    const bySeverityMap = new Map<string, number>();
    const byDeptMap = new Map<string, number>();
    const byAssigneeMap = new Map<string, number>();
    const trendMap = new Map<string, number>();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      trendMap.set(d.toISOString().slice(0, 10), 0);
    }

    for (const item of items) {
      byStatusMap.set(item.status, (byStatusMap.get(item.status) ?? 0) + 1);
      if (item.type === 'bug' && item.bug?.severity) {
        bySeverityMap.set(
          item.bug.severity,
          (bySeverityMap.get(item.bug.severity) ?? 0) + 1
        );
      }
      byDeptMap.set(
        item.departmentId,
        (byDeptMap.get(item.departmentId) ?? 0) + 1
      );
      if (item.assigneeId) {
        byAssigneeMap.set(
          item.assigneeId,
          (byAssigneeMap.get(item.assigneeId) ?? 0) + 1
        );
      }
      if (item.status === 'done' || item.status === 'completed' || item.status === 'closed') {
        const day = item.updatedAt.slice(0, 10);
        if (trendMap.has(day)) {
          trendMap.set(day, (trendMap.get(day) ?? 0) + 1);
        }
      }
    }

    return {
      openWork: items.filter((i) => openStatuses.has(i.status)).length,
      inProgress: items.filter((i) => i.status === 'in_progress' || i.status === 'investigating')
        .length,
      readyToTest: items.filter((i) => i.status === 'ready_to_test').length,
      overdue: items.filter(
        (i) =>
          i.dueDate &&
          new Date(i.dueDate) < new Date() &&
          i.status !== 'done' &&
          i.status !== 'cancelled' &&
          i.status !== 'completed' &&
          i.status !== 'closed'
      ).length,
      criticalBugs: items.filter(
        (i) =>
          i.type === 'bug' &&
          (i.priority === 'critical' ||
            i.bug?.severity === 'blocker' ||
            i.bug?.severity === 'critical')
      ).length,
      completedThisWeek: items.filter(
        (i) =>
          (i.status === 'done' || i.status === 'completed' || i.status === 'closed') &&
          new Date(i.updatedAt) >= weekAgo
      ).length,
      byStatus: Array.from(byStatusMap.entries()).map(([status, count]) => ({
        status,
        count,
      })),
      bySeverity: Array.from(bySeverityMap.entries()).map(([severity, count]) => ({
        severity,
        count,
      })),
      byDepartment: Array.from(byDeptMap.entries()).map(([departmentId, count]) => ({
        departmentId,
        name:
          store.departments.find((d) => d.id === departmentId)?.name ??
          departmentId,
        count,
      })),
      byAssignee: Array.from(byAssigneeMap.entries()).map(([userId, count]) => ({
        userId,
        name: userName(store, userId),
        count,
      })),
      completedTrend: Array.from(trendMap.entries()).map(([date, count]) => ({
        date,
        count,
      })),
    };
  }

  async resetDemoData() {
    resetStore();
  }
}
