'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  LANDING_SECTION_IDS,
  type LandingSectionId,
} from '@/types/landing-builder';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import cn from '@/utils/class-names';

const LABELS: Record<LandingSectionId, string> = {
  navbar: 'Navbar',
  hero: 'Hero',
  features: 'Features',
  about: 'About',
  pricing: 'Pricing',
  testimonials: 'Testimonials',
  faq: 'FAQ',
  cta: 'CTA',
  footer: 'Footer',
};

function SortableRow({
  id,
  onRemove,
}: {
  id: LandingSectionId;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-2 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900/80',
        isDragging && 'z-10 shadow-lg ring-2 ring-indigo-500/30',
      )}
    >
      <button
        type="button"
        className="touch-none shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="min-w-0 flex-1 font-medium text-zinc-800 dark:text-zinc-200">
        {LABELS[id]}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded-lg p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
        title="Remove section from page"
        aria-label={`Remove ${LABELS[id]}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

type Props = {
  order: LandingSectionId[];
  onChange: (next: LandingSectionId[]) => void;
};

export function SectionManager({ order, onChange }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(active.id as LandingSectionId);
    const newIndex = order.indexOf(over.id as LandingSectionId);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(order, oldIndex, newIndex));
  };

  const available = LANDING_SECTION_IDS.filter((id) => !order.includes(id));

  const remove = (id: LandingSectionId) => {
    onChange(order.filter((x) => x !== id));
  };

  const add = (id: LandingSectionId) => {
    if (order.includes(id)) return;
    onChange([...order, id]);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          On the page (drag to reorder)
        </p>
        {order.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 px-3 py-6 text-center text-sm text-zinc-500 dark:border-zinc-600">
            No sections — add blocks below.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext items={order} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {order.map((id) => (
                  <SortableRow
                    key={id}
                    id={id}
                    onRemove={() => remove(id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {available.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Add section
          </p>
          <div className="flex flex-wrap gap-2">
            {available.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => add(id)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/40"
              >
                <Plus className="h-3.5 w-3.5" />
                {LABELS[id]}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
