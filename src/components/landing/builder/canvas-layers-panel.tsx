'use client';

import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronRight, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  hasNestedBlockChildren,
  type CanvasBlock,
  type CanvasPage,
  type CanvasSection,
} from '@/types/landing-canvas';
import {
  appendBlockToContainer,
  containerKeyForGrid,
  containerKeyForSection,
  containerKeyForStack,
  deleteBlockById,
  addSection,
  removeSection,
  reorderInContainer,
  reorderSections,
} from '@/lib/landing-builder/canvas-mutators';
import {
  defaultSection,
} from '@/lib/landing-builder/canvas-defaults';
import { SECTION_BLOCK_PRESETS } from '@/lib/landing-builder/block-presets';
import cn from '@/utils/class-names';

type RowProps = {
  id: string;
  containerKey: string;
  label: string;
  onSelect: () => void;
  selected: boolean;
  onDelete?: () => void;
  depth: number;
};

function SortableLayerRow({
  id,
  containerKey,
  label,
  onSelect,
  selected,
  onDelete,
  depth,
}: RowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, data: { containerKey } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: depth * 10,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 rounded-xl border px-2 py-2 text-sm',
        selected
          ? 'border-indigo-400 bg-indigo-50/80 dark:border-indigo-500 dark:bg-indigo-950/40'
          : 'border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900/80',
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
      <button
        type="button"
        className="min-w-0 flex-1 truncate text-left font-medium text-zinc-800 dark:text-zinc-200"
        onClick={onSelect}
      >
        {label}
      </button>
      {onDelete ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="shrink-0 rounded-lg p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

function labelForBlock(b: CanvasBlock): string {
  if (b.type === 'text') return `Text — ${b.content.slice(0, 28) || '(empty)'}`;
  if (b.type === 'copy') return `Copy — ${b.headline.slice(0, 24) || '(empty)'}`;
  if (b.type === 'navbar') return `Navbar — ${b.logoText}`;
  if (b.type === 'footer') return 'Footer';
  if (b.type === 'image') return 'Image';
  if (b.type === 'button') return `Button — ${b.label}`;
  if (b.type === 'form') return `Form — ${b.title || 'Untitled form'}`;
  if (b.type === 'card') return `Card — ${b.title.slice(0, 20) || '(empty)'}`;
  if (b.type === 'grid')
    return `Grid — ${b.columnsSmall ?? 1} / ${b.columns} cols (sm / lg+)`;
  return 'Row / group';
}

function MiniAdd({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-medium text-zinc-700 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/40"
    >
      <Plus className="h-3 w-3" />
      {label}
    </button>
  );
}

function BlockRows({
  blocks,
  containerKey,
  selectedId,
  onSelect,
  onDeleteBlock,
  depth,
}: {
  blocks: CanvasBlock[];
  containerKey: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDeleteBlock: (id: string) => void;
  depth: number;
}) {
  const ids = blocks.map((b) => b.id);
  return (
    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
      <div className="flex flex-col gap-2">
        {blocks.map((b) =>
          hasNestedBlockChildren(b) ? (
            <div key={b.id} className="space-y-2">
              <SortableLayerRow
                id={b.id}
                containerKey={containerKey}
                label={labelForBlock(b)}
                onSelect={() => onSelect(b.id)}
                selected={selectedId === b.id}
                onDelete={() => onDeleteBlock(b.id)}
                depth={depth}
              />
              <div className="border-l border-zinc-200 pl-2 dark:border-zinc-700">
                <BlockRows
                  blocks={b.children}
                  containerKey={
                    b.type === 'stack'
                      ? containerKeyForStack(b.id)
                      : containerKeyForGrid(b.id)
                  }
                  selectedId={selectedId}
                  onSelect={onSelect}
                  onDeleteBlock={onDeleteBlock}
                  depth={depth + 1}
                />
              </div>
            </div>
          ) : (
            <SortableLayerRow
              key={b.id}
              id={b.id}
              containerKey={containerKey}
              label={labelForBlock(b)}
              onSelect={() => onSelect(b.id)}
              selected={selectedId === b.id}
              onDelete={() => onDeleteBlock(b.id)}
              depth={depth}
            />
          ),
        )}
      </div>
    </SortableContext>
  );
}

function SectionCard({
  section,
  canvas,
  selectedId,
  onSelect,
  onChange,
  onMirrorSectionStructure,
}: {
  section: CanvasSection;
  canvas: CanvasPage;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onChange: (next: CanvasPage) => void;
  onMirrorSectionStructure?: (mutator: (c: CanvasPage) => CanvasPage) => void;
}) {
  const [open, setOpen] = useState(true);
  const sectionKey = containerKeyForSection(section.id);

  const append = (block: CanvasBlock) => {
    onChange(appendBlockToContainer(canvas, sectionKey, block));
    onSelect(block.id);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3 dark:border-zinc-700 dark:bg-zinc-900/40">
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="mt-0.5 shrink-0 text-zinc-500"
          aria-expanded={open}
        >
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={() => onSelect(section.id)}
        >
          <p
            className={cn(
              'truncate text-sm font-semibold',
              selectedId === section.id
                ? 'text-indigo-700 dark:text-indigo-300'
                : 'text-zinc-900 dark:text-white',
            )}
          >
            {section.name}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {section.children.length} block{section.children.length === 1 ? '' : 's'}
          </p>
        </button>
        <button
          type="button"
          title="Delete section"
          onClick={() =>
            onMirrorSectionStructure
              ? onMirrorSectionStructure((c) => removeSection(c, section.id))
              : onChange(removeSection(canvas, section.id))
          }
          className="shrink-0 rounded-lg p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {open ? (
        <div className="mt-3 space-y-3">
          <BlockRows
            blocks={section.children}
            containerKey={sectionKey}
            selectedId={selectedId}
            onSelect={onSelect}
            onDeleteBlock={(id) => onChange(deleteBlockById(canvas, id))}
            depth={0}
          />
          <div className="flex flex-wrap gap-1.5">
            {SECTION_BLOCK_PRESETS.map((preset) => (
              <MiniAdd
                key={preset.key}
                label={preset.label}
                onClick={() => append(preset.create())}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SortableSectionShell({
  section,
  canvas,
  selectedId,
  onSelect,
  onChange,
  onMirrorSectionStructure,
}: {
  section: CanvasSection;
  canvas: CanvasPage;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onChange: (next: CanvasPage) => void;
  onMirrorSectionStructure?: (mutator: (c: CanvasPage) => CanvasPage) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && 'z-10 opacity-90')}
    >
      <div className="mb-2 flex items-center gap-2">
        <button
          type="button"
          className="touch-none text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          aria-label="Drag section"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
          Section
        </span>
      </div>
      <SectionCard
        section={section}
        canvas={canvas}
        selectedId={selectedId}
        onSelect={onSelect}
        onChange={onChange}
        onMirrorSectionStructure={onMirrorSectionStructure}
      />
    </div>
  );
}

type Props = {
  canvas: CanvasPage;
  onChange: (next: CanvasPage) => void;
  /** When set, section add/delete/reorder applies to both EN and AR canvases. */
  onMirrorSectionStructure?: (mutator: (c: CanvasPage) => CanvasPage) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

export function CanvasLayersPanel({
  canvas,
  onChange,
  onMirrorSectionStructure,
  selectedId,
  onSelect,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const isSection = (id: string) => canvas.sections.some((s) => s.id === id);
    if (isSection(activeId) && isSection(overId)) {
      if (onMirrorSectionStructure) {
        onMirrorSectionStructure((c) => reorderSections(c, activeId, overId));
      } else {
        onChange(reorderSections(canvas, activeId, overId));
      }
      return;
    }

    const activeKey = (active.data.current as { containerKey?: string } | undefined)
      ?.containerKey;
    const overKey =
      (over.data.current as { containerKey?: string } | undefined)?.containerKey ??
      activeKey;
    if (activeKey && overKey && activeKey === overKey) {
      onChange(reorderInContainer(canvas, activeKey, activeId, overId));
    }
  };

  const sectionIds = canvas.sections.map((s) => s.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Layers</p>
        <button
          type="button"
          onClick={() => {
            const sec = defaultSection(`Section ${canvas.sections.length + 1}`);
            if (onMirrorSectionStructure) {
              onMirrorSectionStructure((c) => addSection(c, sec));
            } else {
              onChange(addSection(canvas, sec));
            }
            onSelect(sec.id);
          }}
          className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-800 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/40"
        >
          <Plus className="h-3.5 w-3.5" />
          Section
        </button>
      </div>

      {canvas.sections.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 px-3 py-6 text-center text-sm text-zinc-500 dark:border-zinc-600">
          No sections yet. Add a section, then add text, images, or buttons.
        </p>
      ) : (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-4">
              {canvas.sections.map((sec) => (
                <SortableSectionShell
                  key={sec.id}
                  section={sec}
                  canvas={canvas}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  onChange={onChange}
                  onMirrorSectionStructure={onMirrorSectionStructure}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
