/**
 * Laravel Work Management adapter — maps snake_case HTTP API ↔ camelCase repo contract.
 * Enable with NEXT_PUBLIC_WM_BACKEND=laravel (see docs/work-management-api.md).
 */
import client from '@/framework/utils';
import type {
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
  departmentToApi,
  filtersToApiPayload,
  filtersToQuery,
  idNum,
  mapActivity,
  mapAttachment,
  mapComment,
  mapDashboardKpis,
  mapDepartment,
  mapLink,
  mapNotification,
  mapProject,
  mapSavedView,
  mapUser,
  mapWorkItem,
  mapWorkLog,
  mapWorkflow,
  projectToApi,
  unwrapData,
  unwrapList,
  workItemCreateToApi,
  workItemUpdateToApi,
} from './mappers';

const api = () => client.workManagement;

function isNotFound(err: unknown): boolean {
  const status = (err as { response?: { status?: number } })?.response?.status;
  return status === 404;
}

export class LaravelWorkManagementRepository implements WorkManagementRepository {
  async listUsers(): Promise<WmUser[]> {
    try {
      const res = await client.users.all('limit=200&page=1');
      const rows = unwrapList<any>(res);
      return rows.map(mapUser);
    } catch {
      return [];
    }
  }

  async getUser(id: string): Promise<WmUser | null> {
    try {
      const res = await client.users.findeOne(id);
      return mapUser(unwrapData(res));
    } catch {
      return null;
    }
  }

  async listDepartments(): Promise<Department[]> {
    const res = await api().departments.all({ limit: 100 });
    return unwrapList(res).map(mapDepartment);
  }

  async getDepartment(id: string): Promise<Department | null> {
    try {
      const res = await api().departments.findOne(id);
      return mapDepartment(unwrapData(res));
    } catch (e) {
      if (isNotFound(e)) return null;
      throw e;
    }
  }

  async createDepartment(input: CreateDepartmentInput): Promise<Department> {
    const res = await api().departments.create(departmentToApi(input));
    return mapDepartment(unwrapData(res));
  }

  async updateDepartment(input: UpdateDepartmentInput): Promise<Department> {
    const { id, ...rest } = input;
    const res = await api().departments.update(
      id,
      departmentToApi(rest as Omit<UpdateDepartmentInput, 'id'>)
    );
    return mapDepartment(unwrapData(res));
  }

  async archiveDepartment(id: string): Promise<Department> {
    const res = await api().departments.archive(id);
    return mapDepartment(unwrapData(res));
  }

  async listProjects(departmentId?: string): Promise<Project[]> {
    const params: Record<string, unknown> = { limit: 100 };
    if (departmentId) params.department_id = Number(departmentId);
    const res = await api().projects.all(params);
    return unwrapList(res).map(mapProject);
  }

  async getProject(id: string): Promise<Project | null> {
    try {
      const res = await api().projects.findOne(id);
      return mapProject(unwrapData(res));
    } catch (e) {
      if (isNotFound(e)) return null;
      throw e;
    }
  }

  async createProject(input: CreateProjectInput): Promise<Project> {
    const res = await api().projects.create(projectToApi(input));
    return mapProject(unwrapData(res));
  }

  async updateProject(input: UpdateProjectInput): Promise<Project> {
    const { id, ...rest } = input;
    const res = await api().projects.update(
      id,
      projectToApi(rest as Omit<UpdateProjectInput, 'id'>)
    );
    return mapProject(unwrapData(res));
  }

  async listWorkItems(filters?: WorkItemFilters): Promise<WorkItem[]> {
    const res = await api().workItems.all(filtersToQuery(filters));
    return unwrapList(res).map(mapWorkItem);
  }

  async getWorkItem(idOrKey: string): Promise<WorkItem | null> {
    try {
      const res = await api().workItems.findOne(idOrKey);
      return mapWorkItem(unwrapData(res));
    } catch (e) {
      if (isNotFound(e)) return null;
      throw e;
    }
  }

  async createWorkItem(input: CreateWorkItemInput): Promise<WorkItem> {
    const res = await api().workItems.create(workItemCreateToApi(input));
    return mapWorkItem(unwrapData(res));
  }

  async updateWorkItem(input: UpdateWorkItemInput): Promise<WorkItem> {
    const { id, ...rest } = input;
    const res = await api().workItems.update(
      id,
      workItemUpdateToApi(rest as Omit<UpdateWorkItemInput, 'id'>)
    );
    return mapWorkItem(unwrapData(res));
  }

  async deleteWorkItem(id: string, _actorId: string): Promise<void> {
    await api().workItems.delete(id);
  }

  async assignWorkItem(
    workItemId: string,
    assigneeId: string | null,
    _actorId: string
  ): Promise<WorkItem> {
    const res = await api().workItems.assign(workItemId, {
      assignee_id: idNum(assigneeId),
    });
    return mapWorkItem(unwrapData(res));
  }

  async transitionStatus(
    workItemId: string,
    toStatus: WorkItemStatus,
    _actorId: string
  ): Promise<WorkItem> {
    const res = await api().workItems.transition(workItemId, {
      to_status: toStatus,
    });
    return mapWorkItem(unwrapData(res));
  }

  async listComments(workItemId: string): Promise<Comment[]> {
    const res = await api().comments.all(workItemId);
    return unwrapList(res).map(mapComment);
  }

  async addComment(
    workItemId: string,
    _authorId: string,
    body: string
  ): Promise<Comment> {
    const res = await api().comments.create(workItemId, { body });
    return mapComment(unwrapData(res));
  }

  async editComment(
    commentId: string,
    _authorId: string,
    body: string
  ): Promise<Comment> {
    const res = await api().comments.update(commentId, { body });
    return mapComment(unwrapData(res));
  }

  async deleteComment(commentId: string, _authorId: string): Promise<void> {
    await api().comments.delete(commentId);
  }

  async listAttachments(workItemId: string): Promise<Attachment[]> {
    const res = await api().attachments.all(workItemId);
    return unwrapList(res).map(mapAttachment);
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
    _uploadedById: string
  ): Promise<Attachment> {
    const original = file.original || file.dataUrl;
    const res = await api().attachments.create(workItemId, {
      name: file.name,
      mime_type: file.mimeType,
      size: file.size,
      original,
      thumbnail: file.thumbnail ?? null,
      server_attachment_id: file.serverId != null ? Number(file.serverId) : null,
    });
    return mapAttachment(unwrapData(res));
  }

  async removeAttachment(attachmentId: string, _actorId: string): Promise<void> {
    await api().attachments.delete(attachmentId);
  }

  async listActivities(workItemId: string) {
    const res = await api().activities.all(workItemId);
    return unwrapList(res).map(mapActivity);
  }

  async listWorkLogs(workItemId: string): Promise<WorkLog[]> {
    const res = await api().workLogs.all(workItemId);
    return unwrapList(res).map(mapWorkLog);
  }

  async addWorkLog(
    workItemId: string,
    _userId: string,
    hours: number,
    date: string,
    description: string
  ): Promise<WorkLog> {
    const res = await api().workLogs.create(workItemId, {
      hours,
      date: String(date).slice(0, 10),
      description,
    });
    return mapWorkLog(unwrapData(res));
  }

  async listLinks(workItemId: string): Promise<WorkItemLink[]> {
    const res = await api().links.all(workItemId);
    return unwrapList(res).map(mapLink);
  }

  async addLink(
    sourceId: string,
    targetId: string,
    type: WorkItemLinkType,
    _actorId: string
  ): Promise<WorkItemLink> {
    const res = await api().links.create(sourceId, {
      target_id: Number(targetId),
      type,
    });
    return mapLink(unwrapData(res));
  }

  async removeLink(linkId: string, _actorId: string): Promise<void> {
    await api().links.delete(linkId);
  }

  async listChildren(parentId: string): Promise<WorkItem[]> {
    const res = await api().workItems.children(parentId);
    return unwrapList(res).map(mapWorkItem);
  }

  async listSavedViews(_userId: string): Promise<SavedView[]> {
    const res = await api().savedViews.all();
    return unwrapList(res).map(mapSavedView);
  }

  async saveView(
    _userId: string,
    name: string,
    filters: WorkItemFilters
  ): Promise<SavedView> {
    const res = await api().savedViews.create({
      name,
      filters: filtersToApiPayload(filters),
    });
    return mapSavedView(unwrapData(res));
  }

  async deleteSavedView(id: string, _userId: string): Promise<void> {
    await api().savedViews.delete(id);
  }

  async listNotifications(_userId: string): Promise<WmNotification[]> {
    const res = await api().notifications.all();
    return unwrapList(res).map(mapNotification);
  }

  async markNotificationRead(id: string, _userId: string): Promise<void> {
    await api().notifications.markRead(id);
  }

  async markAllNotificationsRead(_userId: string): Promise<void> {
    await api().notifications.markAllRead();
  }

  async listWorkflows(): Promise<WorkflowDefinition[]> {
    const res = await api().workflows.all();
    return unwrapList(res).map(mapWorkflow);
  }

  async getWorkflow(id: string): Promise<WorkflowDefinition | null> {
    try {
      const res = await api().workflows.findOne(id);
      return mapWorkflow(unwrapData(res));
    } catch (e) {
      if (isNotFound(e)) return null;
      throw e;
    }
  }

  async getWorkflowForProject(projectId: string): Promise<WorkflowDefinition> {
    const res = await api().projects.workflow(projectId);
    return mapWorkflow(unwrapData(res));
  }

  async upsertWorkflow(workflow: WorkflowDefinition): Promise<WorkflowDefinition> {
    const res = await api().workflows.upsert(workflow.id, {
      name: workflow.name,
      statuses: workflow.statuses,
      transitions: workflow.transitions,
    });
    return mapWorkflow(unwrapData(res));
  }

  async getDashboardKpis(): Promise<DashboardKpis> {
    const res = await api().dashboard.kpis();
    // KPI payload is { data: { ...kpis } } — not an array
    const raw =
      (res as any)?.data && !Array.isArray((res as any).data)
        ? (res as any).data
        : unwrapData(res);
    return mapDashboardKpis(raw);
  }
}
