'use client';

import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import {
  WORK_ITEM_PRIORITY_LABELS,
  WORK_ITEM_STATUS_LABELS,
  WORK_ITEM_TYPE_LABELS,
  type Department,
  type Project,
  type WorkItem,
  type WmUser,
  type WorkflowDefinition,
} from '@/types/work-management';
import { getBoardColumns } from '@/lib/work-management';
import {
  WmBadge,
  priorityTone,
  statusTone,
} from './ui';
import { useTransitionWorkItemStatus } from '@/framework/work-management/work-items';
import { useWmActorId } from '@/framework/work-management/keys';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { ActionIcon } from '@/components/ui/action-icon';
import { Tooltip } from '@/components/ui/tooltip';
import {
  PiCalendarBlank,
  PiEye,
  PiPencilSimpleBold,
  PiUser,
} from 'react-icons/pi';
import WorkItemForm from './work-item-form';
import WorkItemViewModal from './work-item-view-modal';
import cn from '@/utils/class-names';

function Card({
  item,
  users,
  projects,
  departments,
  dragging,
  showActions = true,
}: {
  item: WorkItem;
  users: WmUser[];
  projects: Project[];
  departments: Department[];
  dragging?: boolean;
  showActions?: boolean;
}) {
  const { openModal } = useModal();
  const assignee = users.find((u) => u.id === item.assigneeId);
  const overdue =
    item.dueDate &&
    new Date(item.dueDate) < new Date() &&
    item.status !== 'done' &&
    item.status !== 'cancelled';

  return (
    <div
      className={cn(
        'group rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:border-gray-300 hover:shadow-md',
        dragging && 'opacity-95 shadow-lg ring-2 ring-primary'
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-primary">{item.key}</span>
          <WmBadge tone={priorityTone(item.priority)}>
            {WORK_ITEM_PRIORITY_LABELS[item.priority]}
          </WmBadge>
        </div>
        {showActions ? (
          <div
            className="flex shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Tooltip size="sm" content={() => 'View'} placement="top" color="invert">
              <ActionIcon
                size="sm"
                variant="outline"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  openModal({
                    view: (
                      <WorkItemViewModal
                        item={item}
                        users={users}
                        projects={projects}
                        departments={departments}
                      />
                    ),
                    customSize: '720px',
                  });
                }}
              >
                <PiEye className="h-3.5 w-3.5" />
              </ActionIcon>
            </Tooltip>
            <Tooltip size="sm" content={() => 'Edit'} placement="top" color="invert">
              <ActionIcon
                size="sm"
                variant="outline"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  openModal({
                    view: <WorkItemForm initValues={item} />,
                    customSize: '720px',
                  });
                }}
              >
                <PiPencilSimpleBold className="h-3.5 w-3.5" />
              </ActionIcon>
            </Tooltip>
          </div>
        ) : null}
      </div>

      <div className="mb-2 text-sm font-semibold leading-snug text-gray-900 line-clamp-2">
        {item.title}
      </div>

      <div className="mb-2">
        <WmBadge>{WORK_ITEM_TYPE_LABELS[item.type]}</WmBadge>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1">
          <PiUser className="h-3.5 w-3.5" />
          {assignee?.name ?? 'Unassigned'}
        </span>
        {item.dueDate ? (
          <span
            className={cn(
              'inline-flex items-center gap-1',
              overdue && 'font-medium text-red-600'
            )}
          >
            <PiCalendarBlank className="h-3.5 w-3.5" />
            {new Date(item.dueDate).toLocaleDateString()}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function DraggableCard({
  item,
  users,
  projects,
  departments,
}: {
  item: WorkItem;
  users: WmUser[];
  projects: Project[];
  departments: Department[];
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: item.id, data: { status: item.status } });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn('cursor-grab touch-none', isDragging && 'opacity-40')}
    >
      <Card
        item={item}
        users={users}
        projects={projects}
        departments={departments}
      />
    </div>
  );
}

function Column({
  status,
  items,
  users,
  projects,
  departments,
}: {
  status: string;
  items: WorkItem[];
  users: WmUser[];
  projects: Project[];
  departments: Department[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex w-80 shrink-0 flex-col rounded-2xl border border-gray-200/80 bg-gradient-to-b from-gray-50 to-gray-100/60',
        isOver && 'ring-2 ring-primary/30'
      )}
    >
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <WmBadge tone={statusTone(status)}>
            {WORK_ITEM_STATUS_LABELS[status] ?? status}
          </WmBadge>
        </div>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-gray-600 shadow-sm">
          {items.length}
        </span>
      </div>
      <div className="flex max-h-[68vh] flex-col gap-2.5 overflow-y-auto px-2.5 pb-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white/50 px-3 py-8 text-center text-xs text-gray-400">
            Drop work items here
          </div>
        ) : (
          items.map((item) => (
            <DraggableCard
              key={item.id}
              item={item}
              users={users}
              projects={projects}
              departments={departments}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function WorkKanbanBoard({
  items,
  users,
  projects = [],
  departments = [],
  workflow,
}: {
  items: WorkItem[];
  users: WmUser[];
  projects?: Project[];
  departments?: Department[];
  workflow: WorkflowDefinition;
}) {
  const actorId = useWmActorId();
  const transition = useTransitionWorkItemStatus();
  const columns = getBoardColumns(workflow);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const byStatus = useMemo(() => {
    const map: Record<string, WorkItem[]> = {};
    for (const col of columns) map[col] = [];
    for (const item of items) {
      if (!map[item.status]) map[item.status] = [];
      map[item.status].push(item);
    }
    return map;
  }, [items, columns]);

  const activeItem = items.find((i) => i.id === activeId) ?? null;

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const itemId = String(active.id);
    const toStatus = String(over.id);
    const item = items.find((i) => i.id === itemId);
    if (!item || item.status === toStatus) return;
    transition.mutate({
      workItemId: item.id,
      toStatus,
      actorId,
    });
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((status) => (
          <Column
            key={status}
            status={status}
            items={byStatus[status] ?? []}
            users={users}
            projects={projects}
            departments={departments}
          />
        ))}
      </div>
      <DragOverlay>
        {activeItem ? (
          <Card
            item={activeItem}
            users={users}
            projects={projects}
            departments={departments}
            dragging
            showActions={false}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
