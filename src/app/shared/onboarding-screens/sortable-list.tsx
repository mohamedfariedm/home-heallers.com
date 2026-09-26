'use client';

import React from 'react';
import Link from 'next/link';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PiDotsSixVerticalBold, PiPencilBold, PiTrashBold } from 'react-icons/pi';
import { ActionIcon } from '@/components/ui/action-icon';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import DeletePopover from '@/app/shared/delete-popover';
import { routes } from '@/config/routes';
import { OnboardingLang, OnboardingScreen } from '@/types/onboarding-screens';

interface SortableListProps {
  screens: OnboardingScreen[];
  lang: OnboardingLang;
  sortable: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onReorder: (ids: number[]) => void;
  onToggleActive: (screen: OnboardingScreen) => void;
  onDelete: (screen: OnboardingScreen) => void;
}

interface RowProps extends Omit<SortableListProps, 'screens' | 'onReorder'> {
  screen: OnboardingScreen;
}

function ScreenRow({
  screen,
  lang,
  sortable,
  canEdit,
  canDelete,
  onToggleActive,
  onDelete,
}: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: screen.id, disabled: !sortable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-opacity sm:gap-4 ${
        isDragging ? 'relative z-10 shadow-lg' : ''
      } ${screen.is_active ? '' : 'opacity-50'}`}
    >
      {sortable && (
        <button
          type="button"
          className="cursor-grab touch-none text-gray-400 hover:text-gray-700 active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <PiDotsSixVerticalBold className="h-5 w-5" />
        </button>
      )}

      <span className="w-6 shrink-0 text-center text-sm font-semibold text-gray-500">
        {screen.order + 1}
      </span>

      <div className="h-20 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
        {screen.image?.[lang] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={screen.image[lang]}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-gray-900" dir="auto">
          {screen.title?.[lang]}
        </p>
        <p className="line-clamp-2 text-xs text-gray-500" dir="auto">
          {screen.description?.[lang]}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Badge
          variant="flat"
          color={screen.is_active ? 'success' : 'secondary'}
          className="hidden sm:inline-flex"
        >
          {screen.is_active ? 'Active' : 'Inactive'}
        </Badge>
        {canEdit && (
          <Switch
            size="sm"
            checked={screen.is_active}
            onChange={() => onToggleActive(screen)}
          />
        )}
        {canEdit && (
          <Link href={routes.onboardingScreens.edit(screen.id)}>
            <ActionIcon size="sm" variant="outline" aria-label="Edit">
              <PiPencilBold className="h-4 w-4" />
            </ActionIcon>
          </Link>
        )}
        {canDelete && (
          <DeletePopover
            title="Delete screen"
            description="Are you sure you want to delete this onboarding screen?"
            onDelete={() => onDelete(screen)}
          >
            <ActionIcon
              size="sm"
              variant="outline"
              aria-label="Delete"
              className="hover:text-red-600"
            >
              <PiTrashBold className="h-4 w-4" />
            </ActionIcon>
          </DeletePopover>
        )}
      </div>
    </div>
  );
}

export default function SortableList({ screens, onReorder, ...rest }: SortableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Sent once on drop, not on every drag move.
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const ids = screens.map((s) => s.id);
    const from = ids.indexOf(Number(active.id));
    const to = ids.indexOf(Number(over.id));
    if (from < 0 || to < 0) return;
    onReorder(arrayMove(ids, from, to));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={screens.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {screens.map((screen) => (
            <ScreenRow key={screen.id} screen={screen} {...rest} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
