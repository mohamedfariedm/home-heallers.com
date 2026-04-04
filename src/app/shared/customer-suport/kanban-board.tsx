'use client';

import {
  DndContext,
  DragOverlay,
  closestCorners,
  closestCenter,
  rectIntersection,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState, useEffect } from 'react';
import KanbanColumn from './kanban-column';
import KanbanCard from './kanban-card';

interface KanbanItem {
  id: number;
  name: string;
  status: string | null;
  mobile_phone?: string;
  reason?: string;
  age?: number;
  gender?: string;
  lead_source?: string;
  address_1?: string;
  offer?: string;
  agent_name?: string;
  notes?: string;
  created_at?: string;
  [key: string]: any;
}

interface Column {
  id: string;
  label: string;
  status: string;
}

interface CustomerSupportKanbanProps {
  columns: Column[];
  columnData: Record<string, { data: any; meta: any; isLoading: boolean }>;
  onStatusChange: (
    itemId: number,
    newStatus: string,
    oldStatus: string
  ) => void;
}

export default function CustomerSupportKanban({
  columns,
  columnData,
  onStatusChange,
}: CustomerSupportKanbanProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [oldStatusMap, setOldStatusMap] = useState<Record<number, string>>({});
  const [movedStatusMap, setMovedStatusMap] = useState<Record<number, string>>({});
  const [overContainerId, setOverContainerId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Build base items by status from server data
  const baseItemsByStatus = columns.reduce(
    (acc, column) => {
      const data = columnData[column.status]?.data?.data || [];
      acc[column.status] = data;
      return acc;
    },
    {} as Record<string, KanbanItem[]>
  );

  // Apply optimistic moved statuses to render immediately
  const itemsByStatus = (() => {
    const allItems: KanbanItem[] = Object.values(baseItemsByStatus).flat();
    const result: Record<string, KanbanItem[]> = {};
    columns.forEach((c) => (result[c.status] = []));

    allItems.forEach((item) => {
      const override = movedStatusMap[item.id];
      const targetStatus = (override || item.status || 'new').toString().toLowerCase();
      const col = columns.find((c) => c.status.toLowerCase() === targetStatus)?.status || 'new';
      result[col].push({ ...item, status: col });
    });

    return result;
  })();

  // Build a map of item IDs to their current status for tracking
  useEffect(() => {
    const statusMap: Record<number, string> = {};
    columns.forEach((column) => {
      const items = itemsByStatus[column.status] || [];
      items.forEach((item) => {
        statusMap[item.id] = column.status;
      });
    });
    setOldStatusMap(statusMap);
    // Clear optimistic moves that are now reflected in server data
    setMovedStatusMap((prev) => {
      const next: Record<number, string> = {};
      Object.entries(prev).forEach(([id, status]) => {
        if (status !== statusMap[Number(id)]) {
          next[Number(id)] = status;
        }
      });
      return next;
    });
  }, [columnData, columns]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragOver = (event: any) => {
    const { over } = event;
    if (!over) {
      setOverContainerId(null);
      return;
    }
    const containerId =
      (over.data?.current as any)?.sortable?.containerId ||
      (over.data?.current as any)?.containerId ||
      (typeof over.id === 'string' ? over.id : null);
    setOverContainerId(containerId || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverContainerId(null);

    if (!over) return;

    const activeId = active.id as number;
    const overId = String(over.id);

    // Debug logging
    console.log('Drag end - over.id:', overId, 'over.data:', over.data?.current);

    // Prefer containerId from SortableContext when dropping over a card
    const containerId =
      (over.data?.current as any)?.sortable?.containerId ||
      (over.data?.current as any)?.containerId ||
      null;

    // First, try to find if dropped directly on a column (by column.id) - exact match
    let targetColumn = columns.find((col) => col.id === (containerId || overId));

    // If not found, try matching with column status
    if (!targetColumn) {
      targetColumn = columns.find((col) => col.status === (containerId || overId));
    }

    // If still not found, check if dropped on a card - find which column contains that card
    if (!targetColumn) {
      const allItems = Object.values(itemsByStatus).flat();
      const targetItem = allItems.find((item) => item.id === Number(overId));
      if (targetItem) {
        // Find the column that contains this item
        const itemStatus = (targetItem.status || 'new').toLowerCase();
        targetColumn = columns.find(
          (col) => col.status.toLowerCase() === itemStatus
        );
      }
    }

    // Try case-insensitive matching
    if (!targetColumn) {
      const overIdLower = overId.toLowerCase();
      targetColumn = columns.find(
        (col) => 
          col.status.toLowerCase() === overIdLower || 
          col.id.toLowerCase() === overIdLower
      );
    }

    // Check if over.data contains column info (from useDroppable data)
    if (!targetColumn && over.data?.current) {
      const columnData = over.data.current.column;
      if (columnData) {
        targetColumn = columns.find(
          (col) => col.id === columnData.id || col.status === columnData.status
        );
      }
    }

    // Final fallback: try to find by matching the overId with any column property
    if (!targetColumn) {
      // Sometimes the ID might be the column status directly
      targetColumn = columns.find(
        (col) => 
          col.id === overId ||
          col.status === overId ||
          col.id.toLowerCase() === overId.toLowerCase() ||
          col.status.toLowerCase() === overId.toLowerCase()
      );
    }

    if (!targetColumn) {
      console.warn('Could not find target column for drop:', {
        overId,
        overData: over.data?.current,
        availableColumns: columns.map((c) => ({ id: c.id, status: c.status })),
      });
      return;
    }

    // Get the old status from our map
    const oldStatus = oldStatusMap[activeId] || 'new';
    const newStatus = targetColumn.status.toLowerCase();

    console.log('Drop successful:', {
      activeId,
      oldStatus,
      newStatus,
      targetColumn: targetColumn.id,
    });

    // Check if status actually changed
    if (oldStatus.toLowerCase() !== newStatus) {
      // Optimistically move item
      setMovedStatusMap((prev) => ({ ...prev, [activeId]: newStatus }));
      // Call the callback to update on server
      onStatusChange(activeId, newStatus, oldStatus);
    }
  };

  // Find active item from all columns
  const activeItem = activeId
    ? Object.values(itemsByStatus)
        .flat()
        .find((item) => item.id === activeId)
    : null;

  // Get all item IDs for SortableContext (must be unique across all columns)
  const allItemIds = Object.values(itemsByStatus)
    .flat()
    .map((item) => item.id);

  // More permissive collision detection: prefer pointer, then rects, then corners
  const collisionDetection = (args: any) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    const rectCollisions = rectIntersection(args);
    if (rectCollisions.length > 0) {
      return rectCollisions;
    }
    return closestCorners(args);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4">
        {columns.map((column) => {
          const columnItems = itemsByStatus[column.status] || [];
          return (
            <KanbanColumn
              key={column.id}
              column={column}
              items={columnItems}
              isHighlighted={
                !!overContainerId &&
                (overContainerId === column.id || overContainerId === column.status)
              }
              onStatusChange={(itemId, newStatus) =>
                onStatusChange(itemId, newStatus, column.status)
              }
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="rotate-3 transform opacity-90">
            <KanbanCard item={activeItem} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
