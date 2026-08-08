'use client';

import { useMemo, useRef, useState } from 'react';
import { PiTrash, PiXBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Title, Text } from '@/components/ui/text';
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

  return (
    <form
      onSubmit={onSubmit}
      className="flex max-h-[80vh] flex-col gap-4 overflow-y-auto p-6"
    >
      <div className="flex items-center justify-between">
        <Title as="h4" className="font-semibold">
          {isEdit ? `Edit ${initValues?.key}` : 'Create Work Item'}
        </Title>
        <Button type="button" variant="text" onClick={closeModal}>
          <PiXBold className="h-4 w-4" />
        </Button>
      </div>
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-4">
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
          <label className="mb-1.5 block text-sm font-medium">Priority</label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={priority}
            onChange={(e) => setPriority(e.target.value as WorkItemPriority)}
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
      {!isEdit ? (
        <div>
          <label className="mb-1.5 block text-sm font-medium">Project</label>
          <Select
            options={projectOptions}
            value={projectOptions.find((o) => o.value === projectId) ?? null}
            onChange={(opt) => {
              setProjectId(opt?.value ?? '');
              setAssigneeId(null);
            }}
            menuPortalTarget={
              typeof document !== 'undefined' ? document.body : null
            }
            styles={{ menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
          />
        </div>
      ) : (
        <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
          Project:{' '}
          <strong>
            {projectOptions.find((o) => o.value === projectId)?.label ??
              projectId}
          </strong>
        </div>
      )}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Assignee</label>
        <Select
          options={assigneeOptions}
          value={assigneeOptions.find((o) => o.value === assigneeId) ?? null}
          onChange={(opt) => setAssigneeId(opt?.value ?? null)}
          isClearable
          placeholder="Unassigned"
          menuPortalTarget={
            typeof document !== 'undefined' ? document.body : null
          }
          styles={{ menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
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
      </div>
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
      <Input
        label="Tags (comma-separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      {type === 'bug' ? (
        <div className="space-y-3 rounded-md border border-gray-200 p-4">
          <Title as="h5" className="text-sm font-semibold">
            Bug details
          </Title>
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
            <label className="mb-1.5 block text-sm font-medium">Severity</label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as BugSeverity)}
            >
              <option value="blocker">Blocker</option>
              <option value="critical">Critical</option>
              <option value="major">Major</option>
              <option value="minor">Minor</option>
              <option value="trivial">Trivial</option>
            </select>
          </div>
        </div>
      ) : null}

      <div className="space-y-3 rounded-md border border-gray-200 p-4">
        <Title as="h5" className="text-sm font-semibold">
          Attachments (images / videos)
        </Title>
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
                        ) : isImageAttachment(file.mimeType, url) && url ? (
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
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={closeModal}>
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={creating || updating || submitting || uploading}
        >
          {isEdit ? 'Save changes' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
