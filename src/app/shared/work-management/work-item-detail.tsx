'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Title, Text } from '@/components/ui/text';
import Spinner from '@/components/ui/spinner';
import {
  useAddComment,
  useAddLink,
  useAddWorkLog,
  useAssignWorkItem,
  useDeleteComment,
  useEditComment,
  useRemoveLink,
  useTransitionWorkItemStatus,
  useUpdateWorkItem,
  useWmActivities,
  useWmAttachments,
  useWmChildren,
  useWmComments,
  useWmLinks,
  useWmWorkItem,
  useWmWorkItems,
  useWmWorkLogs,
} from '@/framework/work-management/work-items';
import { useWmDepartments, useWmUsers } from '@/framework/work-management/departments';
import {
  useWmProjects,
  useWmWorkflowForProject,
} from '@/framework/work-management/projects';
import { useWmActorId } from '@/framework/work-management/keys';
import { WmActorSwitcher } from '@/framework/work-management/actor-switcher';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  WORK_ITEM_PRIORITY_LABELS,
  WORK_ITEM_STATUS_LABELS,
  WORK_ITEM_TYPE_LABELS,
  type WorkItemLinkType,
  type WorkItemPriority,
} from '@/types/work-management';
import {
  WmBadge,
  WmWorkItemLink,
  priorityTone,
  statusTone,
  WmOpenModalButton,
} from './ui';
import WorkItemForm from './work-item-form';
import WorkItemAttachmentsPanel from './work-item-attachments';
import { canTransition } from '@/lib/work-management';
import { hasWmPermission, WM_PERMISSIONS } from '@/lib/work-management/permissions';

const selectClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm';

export default function WorkItemDetail({ itemKey }: { itemKey: string }) {
  const actorId = useWmActorId();
  const { openModal } = useModal();
  const { data: item, isLoading } = useWmWorkItem(itemKey);
  const { data: users = [] } = useWmUsers();
  const { data: projects = [] } = useWmProjects();
  const { data: departments = [] } = useWmDepartments();
  const { data: workflow } = useWmWorkflowForProject(item?.projectId);
  const { data: comments = [] } = useWmComments(item?.id ?? '');
  const { data: activities = [] } = useWmActivities(item?.id ?? '');
  const { data: attachments = [] } = useWmAttachments(item?.id ?? '');
  const { data: workLogs = [] } = useWmWorkLogs(item?.id ?? '');
  const { data: links = [] } = useWmLinks(item?.id ?? '');
  const { data: children = [] } = useWmChildren(item?.id ?? '');
  const { data: allItems = [] } = useWmWorkItems();

  const assign = useAssignWorkItem();
  const transition = useTransitionWorkItemStatus();
  const update = useUpdateWorkItem();
  const addComment = useAddComment();
  const editComment = useEditComment();
  const deleteComment = useDeleteComment();
  const addWorkLog = useAddWorkLog();
  const addLink = useAddLink();
  const removeLink = useRemoveLink();

  const [commentBody, setCommentBody] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [logHours, setLogHours] = useState('1');
  const [logDate, setLogDate] = useState(new Date().toISOString().slice(0, 10));
  const [logDesc, setLogDesc] = useState('');
  const [linkType, setLinkType] = useState<WorkItemLinkType>('related_to');
  const [linkTargetId, setLinkTargetId] = useState('');

  const canAssign = hasWmPermission(null, WM_PERMISSIONS.workItemsAssign);
  const canStatus = hasWmPermission(null, WM_PERMISSIONS.workItemsChangeStatus);
  const canComment = hasWmPermission(null, WM_PERMISSIONS.commentsCreate);
  const canAttach = hasWmPermission(null, WM_PERMISSIONS.attachmentsCreate);

  const project = projects.find((p) => p.id === item?.projectId);
  const department = departments.find((d) => d.id === item?.departmentId);
  const nameOf = (id: string | null | undefined) =>
    id ? users.find((u) => u.id === id)?.name ?? id : 'Unassigned';

  const assigneeOptions = useMemo(() => {
    if (!project || !department) return users;
    const allowed = new Set(
      [
        ...project.memberIds,
        ...department.memberIds,
        project.ownerId,
        department.managerId,
      ].filter(Boolean) as string[]
    );
    return users.filter((u) => allowed.has(u.id));
  }, [users, project, department]);

  const allowedNextStatuses = useMemo(() => {
    if (!item || !workflow) return [];
    return (workflow.transitions[item.status] ?? []).filter((to) =>
      canTransition(workflow, item.status, to)
    );
  }, [item, workflow]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-gray-500">
        Work item not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <WmBadge>{WORK_ITEM_TYPE_LABELS[item.type]}</WmBadge>
            <WmBadge tone={statusTone(item.status)}>
              {WORK_ITEM_STATUS_LABELS[item.status] ?? item.status}
            </WmBadge>
            <WmBadge tone={priorityTone(item.priority)}>
              {WORK_ITEM_PRIORITY_LABELS[item.priority]}
            </WmBadge>
            <span className="text-sm font-semibold text-primary">{item.key}</span>
          </div>
          <Title as="h2" className="text-2xl font-semibold text-gray-900">
            {item.title}
          </Title>
          <Text className="mt-1 text-sm text-gray-500">
            {project?.key} · {department?.name} · Reporter {nameOf(item.reporterId)}
          </Text>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <WmActorSwitcher />
          <Button
            variant="outline"
            onClick={() =>
              openModal({
                view: <WorkItemForm initValues={item} />,
                customSize: '720px',
              })
            }
          >
            Edit
          </Button>
          <WmOpenModalButton
            label="Add subtask"
            view={
              <WorkItemForm
                defaultProjectId={item.projectId}
                defaultParentId={item.id}
              />
            }
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <Title as="h4" className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Description
            </Title>
            <p className="whitespace-pre-wrap text-sm text-gray-800">
              {item.description || 'No description'}
            </p>
            {item.type === 'bug' && item.bug ? (
              <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
                <p>
                  <strong>Severity:</strong> {item.bug.severity}
                </p>
                <p>
                  <strong>Environment:</strong> {item.bug.environment}
                </p>
                <p>
                  <strong>Steps:</strong>
                </p>
                <pre className="whitespace-pre-wrap rounded bg-gray-50 p-3 text-xs">
                  {item.bug.stepsToReproduce}
                </pre>
                <p>
                  <strong>Expected:</strong> {item.bug.expectedResult}
                </p>
                <p>
                  <strong>Actual:</strong> {item.bug.actualResult}
                </p>
              </div>
            ) : null}
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <Title as="h4" className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Subtasks
            </Title>
            {children.length === 0 ? (
              <Text className="text-sm text-gray-500">No subtasks</Text>
            ) : (
              <ul className="space-y-2">
                {children.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
                    <WmWorkItemLink itemKey={c.key} />
                    <span className="truncate">{c.title}</span>
                    <WmBadge tone={statusTone(c.status)}>
                      {WORK_ITEM_STATUS_LABELS[c.status] ?? c.status}
                    </WmBadge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <Title as="h4" className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Related items
            </Title>
            <ul className="mb-3 space-y-2">
              {links.map((l) => {
                const otherId = l.sourceId === item.id ? l.targetId : l.sourceId;
                const other = allItems.find((w) => w.id === otherId);
                return (
                  <li key={l.id} className="flex items-center justify-between text-sm">
                    <span>
                      <WmBadge>{l.type.replace('_', ' ')}</WmBadge>{' '}
                      {other ? <WmWorkItemLink itemKey={other.key} /> : otherId}
                    </span>
                    <Button
                      size="sm"
                      variant="text"
                      onClick={() =>
                        removeLink.mutate({
                          linkId: l.id,
                          actorId,
                          workItemId: item.id,
                        })
                      }
                    >
                      Remove
                    </Button>
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-wrap gap-2">
              <select
                className={selectClass + ' max-w-[160px]'}
                value={linkType}
                onChange={(e) => setLinkType(e.target.value as WorkItemLinkType)}
              >
                <option value="blocks">Blocks</option>
                <option value="blocked_by">Blocked By</option>
                <option value="related_to">Related To</option>
                <option value="duplicate_of">Duplicate Of</option>
              </select>
              <select
                className={selectClass + ' min-w-[180px] flex-1'}
                value={linkTargetId}
                onChange={(e) => setLinkTargetId(e.target.value)}
              >
                <option value="">Select item…</option>
                {allItems
                  .filter((w) => w.id !== item.id)
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.key} — {w.title}
                    </option>
                  ))}
              </select>
              <Button
                size="sm"
                disabled={!linkTargetId}
                onClick={() => {
                  addLink.mutate({
                    sourceId: item.id,
                    targetId: linkTargetId,
                    type: linkType,
                    actorId,
                  });
                  setLinkTargetId('');
                }}
              >
                Link
              </Button>
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <Title as="h4" className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Comments
            </Title>
            <div className="mb-4 space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="rounded-md bg-gray-50 p-3 text-sm">
                  <div className="mb-1 flex items-center justify-between">
                    <strong>{nameOf(c.authorId)}</strong>
                    <span className="text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {editingCommentId === c.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={commentBody}
                        onChange={(e) => setCommentBody(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            editComment.mutate({
                              commentId: c.id,
                              authorId: actorId,
                              body: commentBody,
                              workItemId: item.id,
                            });
                            setEditingCommentId(null);
                            setCommentBody('');
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingCommentId(null);
                            setCommentBody('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{c.body}</p>
                  )}
                  {c.authorId === actorId && editingCommentId !== c.id ? (
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="text"
                        onClick={() => {
                          setEditingCommentId(c.id);
                          setCommentBody(c.body);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="text"
                        onClick={() =>
                          deleteComment.mutate({
                            commentId: c.id,
                            authorId: actorId,
                            workItemId: item.id,
                          })
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            {canComment ? (
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a comment… Use @Name to mention"
                  value={editingCommentId ? '' : commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  disabled={!!editingCommentId}
                />
                <Button
                  size="sm"
                  disabled={!commentBody.trim() || !!editingCommentId}
                  onClick={() => {
                    addComment.mutate({
                      workItemId: item.id,
                      authorId: actorId,
                      body: commentBody,
                    });
                    setCommentBody('');
                  }}
                >
                  Comment
                </Button>
              </div>
            ) : null}
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <Title as="h4" className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Attachments
            </Title>
            <WorkItemAttachmentsPanel
              workItemId={item.id}
              attachments={attachments}
              canAttach={canAttach}
            />
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <Title as="h4" className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Time tracking
            </Title>
            <div className="mb-3 grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded bg-gray-50 p-3">
                <div className="text-xs text-gray-500">Original</div>
                <div className="font-semibold">{item.estimate.originalHours}h</div>
              </div>
              <div className="rounded bg-gray-50 p-3">
                <div className="text-xs text-gray-500">Remaining</div>
                <div className="font-semibold">{item.estimate.remainingHours}h</div>
              </div>
              <div className="rounded bg-gray-50 p-3">
                <div className="text-xs text-gray-500">Completed</div>
                <div className="font-semibold">{item.estimate.completedHours}h</div>
              </div>
            </div>
            <ul className="mb-3 space-y-2 text-sm">
              {workLogs.map((l) => (
                <li key={l.id} className="flex justify-between gap-2">
                  <span>
                    {nameOf(l.userId)} · {l.hours}h · {l.date}
                  </span>
                  <span className="truncate text-gray-500">{l.description}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <Input
                type="number"
                min={0.25}
                step={0.25}
                value={logHours}
                onChange={(e) => setLogHours(e.target.value)}
                className="w-24"
              />
              <Input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
              />
              <Input
                placeholder="What did you work on?"
                value={logDesc}
                onChange={(e) => setLogDesc(e.target.value)}
                className="min-w-[180px] flex-1"
              />
              <Button
                size="sm"
                onClick={() =>
                  addWorkLog.mutate({
                    workItemId: item.id,
                    userId: actorId,
                    hours: Number(logHours),
                    date: logDate,
                    description: logDesc,
                    itemKey: item.key,
                  })
                }
              >
                Log work
              </Button>
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <Title as="h4" className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Activity
            </Title>
            <ul className="space-y-3">
              {activities.map((a) => (
                <li key={a.id} className="border-l-2 border-gray-200 pl-3 text-sm">
                  <div>{a.message}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(a.createdAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">
              Status
            </label>
            {canStatus ? (
              <select
                className={selectClass}
                value={item.status}
                onChange={(e) =>
                  transition.mutate({
                    workItemId: item.id,
                    toStatus: e.target.value,
                    actorId,
                  })
                }
              >
                <option value={item.status}>
                  {WORK_ITEM_STATUS_LABELS[item.status] ?? item.status}
                </option>
                {allowedNextStatuses.map((s) => (
                  <option key={s} value={s}>
                    → {WORK_ITEM_STATUS_LABELS[s] ?? s}
                  </option>
                ))}
              </select>
            ) : (
              <WmBadge tone={statusTone(item.status)}>
                {WORK_ITEM_STATUS_LABELS[item.status] ?? item.status}
              </WmBadge>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">
              Assignee
            </label>
            {canAssign ? (
              <select
                className={selectClass}
                value={item.assigneeId ?? ''}
                onChange={(e) =>
                  assign.mutate({
                    workItemId: item.id,
                    assigneeId: e.target.value || null,
                    actorId,
                  })
                }
              >
                <option value="">Unassigned</option>
                {assigneeOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            ) : (
              <Text className="text-sm">{nameOf(item.assigneeId)}</Text>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">
              Priority
            </label>
            <select
              className={selectClass}
              value={item.priority}
              onChange={(e) =>
                update.mutate({
                  id: item.id,
                  priority: e.target.value as WorkItemPriority,
                  actorId,
                })
              }
            >
              {Object.entries(WORK_ITEM_PRIORITY_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
            <div className="mb-2 flex justify-between">
              <span className="text-gray-500">Due</span>
              <span>
                {item.dueDate
                  ? new Date(item.dueDate).toLocaleDateString()
                  : '—'}
              </span>
            </div>
            <div className="mb-2 flex justify-between">
              <span className="text-gray-500">Created</span>
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Updated</span>
              <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
            </div>
            {item.tags.length ? (
              <div className="mt-3 flex flex-wrap gap-1">
                {item.tags.map((t) => (
                  <WmBadge key={t}>{t}</WmBadge>
                ))}
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
