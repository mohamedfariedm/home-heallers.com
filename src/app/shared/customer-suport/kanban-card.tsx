'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import cn from '@/utils/class-names';
import {
  PiPhone,
  PiMapPin,
  PiUser,
  PiCalendar,
  PiPencilSimpleBold,
  PiEye,
} from 'react-icons/pi';
import { useModal } from '@/app/shared/modal-views/use-modal';
import KanbanCardModal from './kanban-card-modal';
import KanbanCardViewModal from './kanban-card-view-modal';
import { useState, useRef } from 'react';

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
  updated_at?: string;
  [key: string]: any;
}

interface KanbanCardProps {
  item: KanbanItem;
  isDragging?: boolean;
}

export default function KanbanCard({
  item,
  isDragging = false,
}: KanbanCardProps) {
  const { openModal } = useModal();
  const [hasMoved, setHasMoved] = useState(false);
  const justDragged = useRef(false);
  const clickStartPos = useRef<{ x: number; y: number; time: number } | null>(
    null
  );
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: item.id,
    disabled: isDragging,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    openModal({
      view: <KanbanCardModal item={item} />,
      customSize: '90vw',
    });
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    openModal({
      view: <KanbanCardViewModal item={item} />,
      customSize: '1000px',
    });
  };

  // Handle click on card (only if not dragging)
  const handleClick = (e: React.MouseEvent) => {
    // Don't open modal if we just finished dragging or are currently dragging
    if (isSortableDragging || hasMoved || justDragged.current) {
      justDragged.current = false;
      return;
    }

    // Check if it was a real click (not a drag end)
    if (clickStartPos.current) {
      const deltaX = Math.abs(e.clientX - clickStartPos.current.x);
      const deltaY = Math.abs(e.clientY - clickStartPos.current.y);
      const timeDelta = Date.now() - clickStartPos.current.time;

      // Only open modal if it was a quick click with minimal movement
      if (deltaX < 5 && deltaY < 5 && timeDelta < 300) {
        e.stopPropagation();
        openModal({
          view: <KanbanCardModal item={item} />,
          customSize: '90vw',
        });
      }
    }
  };

  // Handle double-click to open modal (doesn't interfere with drag)
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSortableDragging) {
      openModal({
        view: <KanbanCardModal item={item} />,
        customSize: '90vw',
      });
    }
  };

  // Track mouse down for click detection
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only track if it's a left click
    if (e.button === 0) {
      clickStartPos.current = {
        x: e.clientX,
        y: e.clientY,
        time: Date.now(),
      };
      setHasMoved(false);

      // Set a timeout to detect if user is dragging
      dragTimeoutRef.current = setTimeout(() => {
        setHasMoved(true);
      }, 100);
    }
  };

  // Track mouse move to detect dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (clickStartPos.current) {
      const deltaX = Math.abs(e.clientX - clickStartPos.current.x);
      const deltaY = Math.abs(e.clientY - clickStartPos.current.y);

      // If moved more than 5px, consider it a drag
      if (deltaX > 5 || deltaY > 5) {
        setHasMoved(true);
        justDragged.current = true;
        if (dragTimeoutRef.current) {
          clearTimeout(dragTimeoutRef.current);
          dragTimeoutRef.current = null;
        }
      }
    }
  };

  // Clean up on mouse up
  const handleMouseUp = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }

    // If we moved significantly, mark as dragged
    if (hasMoved) {
      justDragged.current = true;
    }

    // Reset after a short delay to allow click handler to check
    setTimeout(() => {
      clickStartPos.current = null;
      setHasMoved(false);
      // Reset justDragged after a longer delay to prevent click after drag
      setTimeout(() => {
        justDragged.current = false;
      }, 200);
    }, 50);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={cn(
        'group relative cursor-grab rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800',
        isSortableDragging && 'cursor-grabbing opacity-50',
        isDragging && 'rotate-3 shadow-xl'
      )}
    >
      {/* Edit and View Buttons - positioned absolutely to not interfere with drag */}
      <div className="absolute right-2 top-2 z-10 flex flex-col gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={handleEditClick}
          onPointerDown={(e) => e.stopPropagation()}
          className="rounded-full bg-gray-100 p-1.5 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
          title="Edit"
        >
          <PiPencilSimpleBold className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </button>
        <button
          onClick={handleViewClick}
          onPointerDown={(e) => e.stopPropagation()}
          className="rounded-full bg-gray-100 p-1.5 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
          title="View"
        >
          <PiEye className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Card Header */}
      <div className="mb-3 pr-12">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          {item.name || 'Unnamed Customer'}
        </h3>
        {item.agent_name && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Agent: {item.agent_name}
          </p>
        )}
      </div>

      {/* Card Content */}
      <div className="space-y-2 text-sm">
        {item.mobile_phone && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <PiPhone className="h-4 w-4 text-gray-400" />
            <span>{item.mobile_phone}</span>
          </div>
        )}

        {item.reason && (
          <div className="flex items-start gap-2">
            <PiUser className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-300">
              {item.reason}
            </span>
          </div>
        )}

        {item.address_1 && (
          <div className="flex items-start gap-2">
            <PiMapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-300">
              {item.address_1}
            </span>
          </div>
        )}

        {item.offer && (
          <div className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            Offer: {item.offer}
          </div>
        )}

        {item.lead_source && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Source: {item.lead_source}
          </div>
        )}

        {item.age && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Age: {item.age} {item.gender && `• ${item.gender}`}
          </div>
        )}

        {(item.created_at || item.updated_at) && (
          <div className="space-y-1 text-xs text-gray-400">
            {item.created_at && (
              <div className="flex items-center gap-2">
                <PiCalendar className="h-3 w-3" />
                <span>Created: {item.created_at}</span>
              </div>
            )}
            {item.updated_at && (
              <div className="flex items-center gap-2">
                <PiCalendar className="h-3 w-3" />
                <span>Modified On: {item.updated_at}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notes Preview */}
      {item.notes && (
        <div className="mt-3 border-t border-gray-100 pt-2 dark:border-gray-700">
          <p className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
            {item.notes}
          </p>
        </div>
      )}
    </div>
  );
}
