/**
 * Future Laravel adapter — same contract as MockWorkManagementRepository.
 * Wire endpoints under client.workManagement in framework/utils/index.ts,
 * then set NEXT_PUBLIC_WM_BACKEND=laravel.
 */
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

const NOT_READY =
  'Laravel Work Management API is not connected yet. Set NEXT_PUBLIC_WM_BACKEND=mock or implement client.workManagement endpoints.';

function fail(): never {
  throw new Error(NOT_READY);
}

export class LaravelWorkManagementRepository implements WorkManagementRepository {
  async listUsers(): Promise<WmUser[]> {
    fail();
  }
  async getUser(_id: string): Promise<WmUser | null> {
    fail();
  }
  async listDepartments(): Promise<Department[]> {
    fail();
  }
  async getDepartment(_id: string): Promise<Department | null> {
    fail();
  }
  async createDepartment(_input: CreateDepartmentInput): Promise<Department> {
    fail();
  }
  async updateDepartment(_input: UpdateDepartmentInput): Promise<Department> {
    fail();
  }
  async archiveDepartment(_id: string): Promise<Department> {
    fail();
  }
  async listProjects(_departmentId?: string): Promise<Project[]> {
    fail();
  }
  async getProject(_id: string): Promise<Project | null> {
    fail();
  }
  async createProject(_input: CreateProjectInput): Promise<Project> {
    fail();
  }
  async updateProject(_input: UpdateProjectInput): Promise<Project> {
    fail();
  }
  async listWorkItems(_filters?: WorkItemFilters): Promise<WorkItem[]> {
    fail();
  }
  async getWorkItem(_idOrKey: string): Promise<WorkItem | null> {
    fail();
  }
  async createWorkItem(_input: CreateWorkItemInput): Promise<WorkItem> {
    fail();
  }
  async updateWorkItem(_input: UpdateWorkItemInput): Promise<WorkItem> {
    fail();
  }
  async deleteWorkItem(_id: string, _actorId: string): Promise<void> {
    fail();
  }
  async assignWorkItem(
    _workItemId: string,
    _assigneeId: string | null,
    _actorId: string
  ): Promise<WorkItem> {
    fail();
  }
  async transitionStatus(
    _workItemId: string,
    _toStatus: WorkItemStatus,
    _actorId: string
  ): Promise<WorkItem> {
    fail();
  }
  async listComments(_workItemId: string): Promise<Comment[]> {
    fail();
  }
  async addComment(
    _workItemId: string,
    _authorId: string,
    _body: string
  ): Promise<Comment> {
    fail();
  }
  async editComment(
    _commentId: string,
    _authorId: string,
    _body: string
  ): Promise<Comment> {
    fail();
  }
  async deleteComment(_commentId: string, _authorId: string): Promise<void> {
    fail();
  }
  async listAttachments(_workItemId: string): Promise<Attachment[]> {
    fail();
  }
  async addAttachment(
    _workItemId: string,
    _file: {
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
    fail();
  }
  async removeAttachment(_attachmentId: string, _actorId: string): Promise<void> {
    fail();
  }
  async listActivities(_workItemId: string): Promise<
    import('@/types/work-management').ActivityEntry[]
  > {
    fail();
  }
  async listWorkLogs(_workItemId: string): Promise<WorkLog[]> {
    fail();
  }
  async addWorkLog(
    _workItemId: string,
    _userId: string,
    _hours: number,
    _date: string,
    _description: string
  ): Promise<WorkLog> {
    fail();
  }
  async listLinks(_workItemId: string): Promise<WorkItemLink[]> {
    fail();
  }
  async addLink(
    _sourceId: string,
    _targetId: string,
    _type: WorkItemLinkType,
    _actorId: string
  ): Promise<WorkItemLink> {
    fail();
  }
  async removeLink(_linkId: string, _actorId: string): Promise<void> {
    fail();
  }
  async listChildren(_parentId: string): Promise<WorkItem[]> {
    fail();
  }
  async listSavedViews(_userId: string): Promise<SavedView[]> {
    fail();
  }
  async saveView(
    _userId: string,
    _name: string,
    _filters: WorkItemFilters
  ): Promise<SavedView> {
    fail();
  }
  async deleteSavedView(_id: string, _userId: string): Promise<void> {
    fail();
  }
  async listNotifications(_userId: string): Promise<WmNotification[]> {
    fail();
  }
  async markNotificationRead(_id: string, _userId: string): Promise<void> {
    fail();
  }
  async markAllNotificationsRead(_userId: string): Promise<void> {
    fail();
  }
  async listWorkflows(): Promise<WorkflowDefinition[]> {
    fail();
  }
  async getWorkflow(_id: string): Promise<WorkflowDefinition | null> {
    fail();
  }
  async getWorkflowForProject(_projectId: string): Promise<WorkflowDefinition> {
    fail();
  }
  async upsertWorkflow(_workflow: WorkflowDefinition): Promise<WorkflowDefinition> {
    fail();
  }
  async getDashboardKpis(): Promise<DashboardKpis> {
    fail();
  }
}
