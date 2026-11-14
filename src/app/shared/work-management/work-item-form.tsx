'use client';

import { useMemo, useRef, useState } from 'react';
import {
  PiTrash,
  PiXBold,
  PiClipboardText,
  PiUserCircle,
  PiPaperclip,
} from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Text } from '@/components/ui/text';
import { ActionIcon } from '@/components/ui/action-icon';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useWmDepartments, useWmUsers } from '@/framework/work-management/departments';
import { useWmProjects } from '@/framework/work-management/projects';
import {
  useAddAttachment,
  useAssignWorkItem,
  useCreateWorkItem,
  useUpdateWorkItem,
  useWmAttachments,
} from '@/framework/work-management/work-items';
import { useWmActorId } from '@/framework/work-management/keys';
import type {
  BugSeverity,
  WorkItem,
  WorkItemPriority,
  WorkItemType,
} from '@/types/work-management';
import Select from 'react-select';
import toast from 'react-hot-toast';
import {
  isImageAttachment,
  isVideoAttachment,
  uploadWmAttachments,
  type UploadedAttachmentFile,
} from '@/lib/work-management/upload-attachment';
import WorkItemAttachmentsPanel from './work-item-attachments';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';

type WorkItemTabId = 'general' | 'assignment' | 'extra';

const WORK_ITEM_TABS: {
  id: WorkItemTabId;
  label: string;
  icon: typeof PiClipboardText;
}[] = [
  { id: 'general', label: 'General', icon: PiClipboardText },
  { id: 'assignment', label: 'Assignment', icon: PiUserCircle },
  { id: 'extra', label: 'Extra', icon: PiPaperclip },
];

function workItemTabHasErrors(
  tabId: WorkItemTabId,
  errors: Record<string, unknown>
): boolean {
  switch (tabId) {
    case 'general':
      return Boolean(
        errors.title ||
          errors.description ||
          errors.type ||
          errors.priority ||
          errors.projectId
      );
    case 'assignment':
      return Boolean(
        errors.assigneeId ||
          errors.dueDate ||
          errors.originalHours ||
          errors.remainingHours ||
          errors.tags
      );
    case 'extra':
      return Boolean(
        errors.steps ||
          errors.expected ||
          errors.actual ||
          errors.environment ||
          errors.severity
      );
    default:
      return false;
  }
}

export default function WorkItemForm({
  initValues,
  defaultProjectId,
  defaultParentId,
}: {
  initValues?: WorkItem;
  defaultProjectId?: string;
  defaultParentId?: string;
}) {
  const { closeModal } = useModal();
  const actorId = useWmActorId();
  const { data: projects = [] } = useWmProjects();
  const { data: users = [] } = useWmUsers();
  const { mutateAsync: create, isPending: creating } = useCreateWorkItem();
  const { mutate: update, isPending: updating } = useUpdateWorkItem();
  const { mutate: assign } = useAssignWorkItem();
  const { mutateAsync: addAttachment } = useAddAttachment();
  const { data: existingAttachments = [] } = useWmAttachments(
    initValues?.id ?? ''
  );
  const isEdit = !!initValues;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, unknown>>({});

  const activeProjects = projects.filter(
    (p) => p.status === 'active' || p.status === 'on_hold'
  );

  const [title, setTitle] = useState(initValues?.title ?? '');
  const [description, setDescription] = useState(initValues?.description ?? '');
  const [type, setType] = useState<WorkItemType>(initValues?.type ?? 'task');
  const [priority, setPriority] = useState<WorkItemPriority>(
    initValues?.priority ?? 'medium'
  );
  const [projectId, setProjectId] = useState(
    initValues?.projectId ?? defaultProjectId ?? activeProjects[0]?.id ?? ''
  );
  const [assigneeId, setAssigneeId] = useState<string | null>(
    initValues?.assigneeId ?? null
  );
  const [dueDate, setDueDate] = useState(
    initValues?.dueDate?.slice(0, 10) ?? ''
  );
  const [tags, setTags] = useState(initValues?.tags?.join(', ') ?? '');
  const [parentId] = useState(initValues?.parentId ?? defaultParentId ?? null);
  const [originalHours, setOriginalHours] = useState(
    String(initValues?.estimate?.originalHours ?? 0)
  );
  const [remainingHours, setRemainingHours] = useState(
    String(initValues?.estimate?.remainingHours ?? 0)
  );

  const [steps, setSteps] = useState(initValues?.bug?.stepsToReproduce ?? '');
  const [expected, setExpected] = useState(initValues?.bug?.expectedResult ?? '');
  const [actual, setActual] = useState(initValues?.bug?.actualResult ?? '');
  const [environment, setEnvironment] = useState(
    initValues?.bug?.environment ?? ''
  );
  const [severity, setSeverity] = useState<BugSeverity>(
    initValues?.bug?.severity ?? 'major'
  );
  const [pendingFiles, setPendingFiles] = useState<UploadedAttachmentFile[]>(
    []
  );
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const project = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projects, projectId]
  );
  const { data: departments = [] } = useWmDepartments();
  const department = departments.find((d) => d.id === project?.departmentId);

  const assigneeOptions = useMemo(() => {
    const allowed = new Set(
      [
        ...(project?.memberIds ?? []),
        ...(department?.memberIds ?? []),
        project?.ownerId,
        department?.managerId,
      ].filter(Boolean) as string[]
    );
    return users
      .filter((u) => allowed.has(u.id) && u.active)
      .map((u) => ({ value: u.id, label: u.name }));
  }, [users, project, department]);

  const projectOptions = (isEdit ? projects : activeProjects).map((p) => ({
    value: p.id,
    label: `${p.key} — ${p.name}`,
  }));

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(WORK_ITEM_TABS.length - 1, index)));
  };

  const onInvalid = (errors: Record<string, unknown>) => {
    const tabIndex = WORK_ITEM_TABS.findIndex((tab) =>
      workItemTabHasErrors(tab.id, errors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const uploadPending = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded = await uploadWmAttachments(files);
      setPendingFiles((prev) => [...prev, ...uploaded]);
      toast.success('File uploaded');
    } catch (error: any) {
      toast.error(error?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, unknown> = {};
    if (!title.trim()) errors.title = true;
    if (!isEdit && !projectId) errors.projectId = true;
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      onInvalid(errors);
      return;
    }
    setFieldErrors({});

    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const bug =
      type === 'bug'
        ? {
            stepsToReproduce: steps,
            expectedResult: expected,
            actualResult: actual,
            environment,
            severity,
          }
        : undefined;

    if (isEdit && initValues) {
      update(
        {
          id: initValues.id,
          title,
          description,
          type,
          priority,
          dueDate: dueDate || null,
          tags: tagList,
          parentId,
          estimate: {
            originalHours: Number(originalHours) || 0,
            remainingHours: Number(remainingHours) || 0,
          },
          bug,
          actorId,
        },
        {
          onSuccess: () => {
            if (assigneeId !== initValues.assigneeId) {
              assign(
                {
                  workItemId: initValues.id,
                  assigneeId,
                  actorId,
                },
                { onSuccess: () => closeModal() }
              );
            } else {
              closeModal();
            }
          },
        }
      );
      return;
    }

    setSubmitting(true);
    try {
      const item = await create({
        title,
        description,
        type,
        priority,
        projectId,
        assigneeId,
        dueDate: dueDate || null,
        tags: tagList,
        parentId,
        estimate: {
          originalHours: Number(originalHours) || 0,
          remainingHours: Number(originalHours) || 0,
          completedHours: 0,
        },
        bug,
        reporterId: actorId,
        createdById: actorId,
      });

      for (const file of pendingFiles) {
        await addAttachment({
          workItemId: item.id,
          uploadedById: actorId,
          file: {
            name: file.name,
            mimeType: file.mimeType,
            size: file.size,
            dataUrl: file.dataUrl || file.original || '',
            original: file.original,
            thumbnail: file.thumbnail,
            serverId: file.serverId,
          },
        });
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create work item');
    } finally {
      setSubmitting(false);
    }
  };

  const isBusy = creating || updating || submitting || uploading;
  const tabsWithErrors: ModalFormTabItem[] = WORK_ITEM_TABS.map((tab) => ({
    ...tab,
    hasError: workItemTabHasErrors(tab.id, fieldErrors),
  }));

  return (
    <form onSubmit={onSubmit} className={modalFormTabsClassName}>
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
            <PiClipboardText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900">
              {isEdit ? `Edit ${initValues?.key}` : 'Create Work Item'}
            </h4>
            <p className="mt-0.5 text-xs text-gray-400">
              Fill each tab — save stays available on every step
            </p>
          </div>
        </div>
        <ActionIcon
          size="sm"
          variant="outline"
          onClick={closeModal}
          className="rounded-lg border-gray-200 text-gray-500 hover:border-[#143087]/40 hover:bg-blue-50 hover:text-[#143087]"
        >
          <PiXBold className="h-4 w-4" />
        </ActionIcon>
      </div>

      <ModalFormTabs
        tabs={tabsWithErrors}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        <ModalFormTabPanel>
          <div className="space-y-5">
            <ModalFormTabPanelCard
              title="General"
              description="Title, type, priority, and project"
            >
              <div className="sm:col-span-2">
                <Input
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  error={fieldErrors.title ? 'Title is required' : undefined}
                />
              </div>
              <div className="sm:col-span-2">
                <Textarea
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Type</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={type}
                  onChange={(e) => setType(e.target.value as WorkItemType)}
                >
                  <option value="task">Task</option>
                  <option value="bug">Bug</option>
                  <option value="story">User Story</option>
                  <option value="improvement">Improvement</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Priority
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as WorkItemPriority)
                  }
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                {!isEdit ? (
                  <>
                    <label className="mb-1.5 block text-sm font-medium">
                      Project
                    </label>
                    <Select
                      options={projectOptions}
                      value={
                        projectOptions.find((o) => o.value === projectId) ??
                        null
                      }
                      onChange={(opt) => {
                        setProjectId(opt?.value ?? '');
                        setAssigneeId(null);
                      }}
                      menuPortalTarget={
                        typeof document !== 'undefined' ? document.body : null
                      }
                      styles={{ menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
                    />
                    {fieldErrors.projectId ? (
                      <p className="mt-1 text-sm text-red-600">
                        Project is required
                      </p>
                    ) : null}
                  </>
                ) : (
                  <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
                    Project:{' '}
                    <strong>
                      {projectOptions.find((o) => o.value === projectId)
                        ?.label ?? projectId}
                    </strong>
                  </div>
                )}
              </div>
            </ModalFormTabPanelCard>
          </div>
        </ModalFormTabPanel>

        <ModalFormTabPanel>
          <div className="space-y-5">
            <ModalFormTabPanelCard
              title="Assignment"
              description="Assignee, dates, and estimates"
            >
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">
                  Assignee
                </label>
                <Select
                  options={assigneeOptions}
                  value={
                    assigneeOptions.find((o) => o.value === assigneeId) ?? null
                  }
                  onChange={(opt) => setAssigneeId(opt?.value ?? null)}
                  isClearable
                  placeholder="Unassigned"
                  menuPortalTarget={
                    typeof document !== 'undefined' ? document.body : null
                  }
                  styles={{ menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
                />
              </div>
              <Input
                label="Due date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <Input
                label="Original estimate (h)"
                type="number"
                min={0}
                step="0.5"
                value={originalHours}
                onChange={(e) => setOriginalHours(e.target.value)}
              />
              {isEdit ? (
                <Input
                  label="Remaining (h)"
                  type="number"
                  min={0}
                  step="0.5"
                  value={remainingHours}
                  onChange={(e) => setRemainingHours(e.target.value)}
                />
              ) : null}
              <div className={isEdit ? undefined : 'sm:col-span-2'}>
                <Input
                  label="Tags (comma-separated)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </ModalFormTabPanelCard>
          </div>
        </ModalFormTabPanel>

        <ModalFormTabPanel>
          <div className="space-y-5">
            {type === 'bug' ? (
              <ModalFormTabPanelCard
                title="Bug details"
                description="Reproduction steps and severity"
                contentClassName="grid gap-4 sm:grid-cols-1"
              >
                <Textarea
                  label="Steps to reproduce"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                />
                <Textarea
                  label="Expected result"
                  value={expected}
                  onChange={(e) => setExpected(e.target.value)}
                />
                <Textarea
                  label="Actual result"
                  value={actual}
                  onChange={(e) => setActual(e.target.value)}
                />
                <Input
                  label="Environment"
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Severity
                  </label>
                  <select
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={severity}
                    onChange={(e) =>
                      setSeverity(e.target.value as BugSeverity)
                    }
                  >
                    <option value="blocker">Blocker</option>
                    <option value="critical">Critical</option>
                    <option value="major">Major</option>
                    <option value="minor">Minor</option>
                    <option value="trivial">Trivial</option>
                  </select>
                </div>
              </ModalFormTabPanelCard>
            ) : null}

            <ModalFormTabPanelCard
              title="Attachments"
              description="Images and videos"
              contentClassName="grid gap-4 sm:grid-cols-1"
            >
              {isEdit && initValues ? (
                <WorkItemAttachmentsPanel
                  workItemId={initValues.id}
                  attachments={existingAttachments}
                  canAttach
                />
              ) : (
                <>
                  {pendingFiles.length ? (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {pendingFiles.map((file, index) => {
                        const url =
                          file.original || file.dataUrl || file.thumbnail || '';
                        return (
                          <div
                            key={`${file.name}-${index}`}
                            className="relative overflow-hidden rounded-lg border border-gray-200"
                          >
                            <div className="aspect-video bg-gray-50">
                              {isVideoAttachment(file.mimeType, url) && url ? (
                                <video
                                  src={url}
                                  className="h-full w-full object-cover"
                                  controls
                                  preload="metadata"
                                />
                              ) : isImageAttachment(file.mimeType, url) &&
                                url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={file.thumbnail || url}
                                  alt={file.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center p-2 text-center text-xs text-gray-500">
                                  {file.name}
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              className="absolute right-1 top-1 rounded-full bg-white p-1 shadow"
                              onClick={() =>
                                setPendingFiles((prev) =>
                                  prev.filter((_, i) => i !== index)
                                )
                              }
                            >
                              <PiTrash className="h-3.5 w-3.5 text-red-500" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <Text className="text-xs text-gray-500">
                      Optional — screenshots, screen recordings, or logs.
                    </Text>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => void uploadPending(e.target.files)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    isLoading={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload images / videos
                  </Button>
                </>
              )}
            </ModalFormTabPanelCard>
          </div>
        </ModalFormTabPanel>
      </ModalFormTabs>

      <ModalFormTabsFooter
        activeTab={activeTab}
        tabCount={WORK_ITEM_TABS.length}
        onPrev={() => goToTab(activeTab - 1)}
        onNext={() => goToTab(activeTab + 1)}
        onCancel={closeModal}
        isLoading={isBusy}
        disabled={isBusy}
        submitLabel={isEdit ? 'Save changes' : 'Create'}
      />
    </form>
  );
}
