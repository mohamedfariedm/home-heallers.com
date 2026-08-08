'use client';

import { PiPencilSimpleBold, PiXBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  WORK_ITEM_PRIORITY_LABELS,
  WORK_ITEM_STATUS_LABELS,
  WORK_ITEM_TYPE_LABELS,
  type WorkItem,
  type WmUser,
  type Project,
  type Department,
} from '@/types/work-management';
import {
  WmBadge,
  priorityTone,
  statusTone,
  wmItemPath,
} from './ui';
import WorkItemForm from './work-item-form';
import WorkItemAttachmentsPanel from './work-item-attachments';
import { useWmAttachments } from '@/framework/work-management/work-items';
import Link from 'next/link';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Text className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </Text>
      <div className="text-sm text-gray-900">{children}</div>
    </div>
  );
}

export default function WorkItemViewModal({
  item,
  users = [],
  projects = [],
  departments = [],
}: {
  item: WorkItem;
  users?: WmUser[];
  projects?: Project[];
  departments?: Department[];
}) {
  const { closeModal, openModal } = useModal();
  const { data: attachments = [] } = useWmAttachments(item.id);
  const nameOf = (id: string | null | undefined) =>
    id ? users.find((u) => u.id === id)?.name ?? id : 'Unassigned';
  const project = projects.find((p) => p.id === item.projectId);
  const department = departments.find((d) => d.id === item.departmentId);

  const openEdit = () => {
    closeModal();
    setTimeout(() => {
      openModal({
        view: <WorkItemForm initValues={item} />,
        customSize: '720px',
      });
    }, 50);
  };

  return (
    <div className="flex max-h-[85vh] flex-col gap-5 overflow-y-auto p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-primary">{item.key}</span>
            <WmBadge>{WORK_ITEM_TYPE_LABELS[item.type]}</WmBadge>
            <WmBadge tone={statusTone(item.status)}>
              {WORK_ITEM_STATUS_LABELS[item.status] ?? item.status}
            </WmBadge>
            <WmBadge tone={priorityTone(item.priority)}>
              {WORK_ITEM_PRIORITY_LABELS[item.priority]}
            </WmBadge>
          </div>
          <Title as="h4" className="font-semibold text-gray-900">
            {item.title}
          </Title>
        </div>
        <Button type="button" variant="text" onClick={closeModal}>
          <PiXBold className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 rounded-xl border border-gray-200 bg-gray-50/80 p-4 sm:grid-cols-2">
        <Field label="Project">
          {project ? `${project.key} — ${project.name}` : '—'}
        </Field>
        <Field label="Department">{department?.name ?? '—'}</Field>
        <Field label="Assignee">{nameOf(item.assigneeId)}</Field>
        <Field label="Reporter">{nameOf(item.reporterId)}</Field>
        <Field label="Due date">
          {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '—'}
        </Field>
        <Field label="Estimate">
          {item.estimate.originalHours}h / {item.estimate.remainingHours}h left /{' '}
          {item.estimate.completedHours}h done
        </Field>
      </div>

      <Field label="Description">
        <p className="whitespace-pre-wrap rounded-lg border border-gray-100 bg-white p-3 text-sm">
          {item.description || 'No description'}
        </p>
      </Field>

      {item.type === 'bug' && item.bug ? (
        <div className="space-y-3 rounded-xl border border-red-100 bg-red-50/40 p-4">
          <Title as="h5" className="text-sm font-semibold text-red-800">
            Bug details
          </Title>
          <Field label="Severity">{item.bug.severity ?? '—'}</Field>
          <Field label="Environment">{item.bug.environment || '—'}</Field>
          <Field label="Steps">
            <pre className="whitespace-pre-wrap text-xs">
              {item.bug.stepsToReproduce || '—'}
            </pre>
          </Field>
          <Field label="Expected">{item.bug.expectedResult || '—'}</Field>
          <Field label="Actual">{item.bug.actualResult || '—'}</Field>
        </div>
      ) : null}

      <div>
        <Text className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
          Attachments
        </Text>
        <WorkItemAttachmentsPanel
          workItemId={item.id}
          attachments={attachments}
          canAttach
        />
      </div>

      {item.tags.length ? (
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((t) => (
            <WmBadge key={t}>{t}</WmBadge>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
        <Button variant="outline" onClick={closeModal}>
          Close
        </Button>
        <Button variant="outline" onClick={openEdit}>
          <PiPencilSimpleBold className="me-1.5 h-4 w-4" />
          Edit
        </Button>
        <Link href={wmItemPath(item.key)} onClick={closeModal}>
          <Button>Open full page</Button>
        </Link>
      </div>
    </div>
  );
}
