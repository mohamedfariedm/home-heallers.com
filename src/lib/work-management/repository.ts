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
  WorkItemLinkType,
  WorkItemStatus,
  WorkLog,
  WorkflowDefinition,
} from '@/types/work-management';

export interface WorkManagementRepository {
  // Users (mock roster)
  listUsers(): Promise<WmUser[]>;
  getUser(id: string): Promise<WmUser | null>;

  // Departments
  listDepartments(): Promise<Department[]>;
  getDepartment(id: string): Promise<Department | null>;
  createDepartment(input: CreateDepartmentInput): Promise<Department>;
  updateDepartment(input: UpdateDepartmentInput): Promise<Department>;
  archiveDepartment(id: string): Promise<Department>;

  // Projects
  listProjects(departmentId?: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  createProject(input: CreateProjectInput): Promise<Project>;
  updateProject(input: UpdateProjectInput): Promise<Project>;

  // Work items
  listWorkItems(filters?: WorkItemFilters): Promise<WorkItem[]>;
  getWorkItem(idOrKey: string): Promise<WorkItem | null>;
  createWorkItem(input: CreateWorkItemInput): Promise<WorkItem>;
  updateWorkItem(input: UpdateWorkItemInput): Promise<WorkItem>;
  deleteWorkItem(id: string, actorId: string): Promise<void>;
  assignWorkItem(
    workItemId: string,
    assigneeId: string | null,
    actorId: string
  ): Promise<WorkItem>;
  transitionStatus(
    workItemId: string,
    toStatus: WorkItemStatus,
    actorId: string
  ): Promise<WorkItem>;

  // Comments
  listComments(workItemId: string): Promise<Comment[]>;
  addComment(
    workItemId: string,
    authorId: string,
    body: string
  ): Promise<Comment>;
  editComment(
    commentId: string,
    authorId: string,
    body: string
  ): Promise<Comment>;
  deleteComment(commentId: string, authorId: string): Promise<void>;

  // Attachments
  listAttachments(workItemId: string): Promise<Attachment[]>;
  addAttachment(
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
  ): Promise<Attachment>;
  removeAttachment(attachmentId: string, actorId: string): Promise<void>;

  // Activity
  listActivities(workItemId: string): Promise<ActivityEntry[]>;

  // Time
  listWorkLogs(workItemId: string): Promise<WorkLog[]>;
  addWorkLog(
    workItemId: string,
    userId: string,
    hours: number,
    date: string,
    description: string
  ): Promise<WorkLog>;

  // Links & hierarchy
  listLinks(workItemId: string): Promise<WorkItemLink[]>;
  addLink(
    sourceId: string,
    targetId: string,
    type: WorkItemLinkType,
    actorId: string
  ): Promise<WorkItemLink>;
  removeLink(linkId: string, actorId: string): Promise<void>;
  listChildren(parentId: string): Promise<WorkItem[]>;

  // Saved views
  listSavedViews(userId: string): Promise<SavedView[]>;
  saveView(
    userId: string,
    name: string,
    filters: WorkItemFilters
  ): Promise<SavedView>;
  deleteSavedView(id: string, userId: string): Promise<void>;

  // Notifications
  listNotifications(userId: string): Promise<WmNotification[]>;
  markNotificationRead(id: string, userId: string): Promise<void>;
  markAllNotificationsRead(userId: string): Promise<void>;

  // Workflows
  listWorkflows(): Promise<WorkflowDefinition[]>;
  getWorkflow(id: string): Promise<WorkflowDefinition | null>;
  getWorkflowForProject(projectId: string): Promise<WorkflowDefinition>;
  upsertWorkflow(workflow: WorkflowDefinition): Promise<WorkflowDefinition>;

  // Dashboard
  getDashboardKpis(): Promise<DashboardKpis>;

  // Dev helper
  resetDemoData?(): Promise<void>;
}
