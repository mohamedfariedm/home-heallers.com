'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import KanbanCard from './kanban-card';
import cn from '@/utils/class-names';
import { ActionIcon } from '@/components/ui/action-icon';
import { Tooltip } from '@/components/ui/tooltip';
import ChatSolidIcon from '@/components/icons/chat-solid';
import WhatsAppSendModal from './whatsapp-send-modal';

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

interface KanbanColumnProps {
  column: Column;
  items: KanbanItem[];
  onStatusChange: (itemId: number, newStatus: string) => void;
  isHighlighted?: boolean;
}

const columnColors: Record<
  string,
  { bg: string; border: string; header: string }
> = {
  new: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-800',
    header: 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100',
  },
  failed: {
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-800',
    header: 'bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-100',
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-950/20',
    border: 'border-green-200 dark:border-green-800',
    header:
      'bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-100',
  },
  possible: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    header:
      'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-900 dark:text-yellow-100',
  },
  negotiation: {
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-200 dark:border-purple-800',
    header:
      'bg-purple-100 dark:bg-purple-900/40 text-purple-900 dark:text-purple-100',
  },
};

export default function KanbanColumn({
  column,
  items,
  onStatusChange,
  isHighlighted = false,
}: KanbanColumnProps) {
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column: column,
      status: column.status,
    },
  });

  const colors = columnColors[column.status] || columnColors.new;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex h-full min-h-[600px] w-80 flex-col rounded-lg border-2 transition-colors',
        colors.border,
        colors.bg,
        (isOver || isHighlighted) && 'ring-2 ring-blue-500 ring-offset-2',
        'relative'
      )}
    >
      {/* Column Header */}
      <div
        className={cn(
          'flex items-center justify-between rounded-t-lg px-4 py-3 font-semibold',
          colors.header
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold uppercase tracking-wide">
            {column.label}
          </span>
          <span className="rounded-full bg-white/50 px-2 py-0.5 text-xs font-medium dark:bg-gray-800/50">
            {items.length}
          </span>
        </div>
        <Tooltip
          size="sm"
          content={() => 'Send WhatsApp Message'}
          placement="top"
          color="invert"
        >
          <ActionIcon
            size="sm"
            variant="text"
            className="cursor-pointer hover:bg-white/20"
            onClick={() => setIsWhatsAppModalOpen(true)}
          >
            <ChatSolidIcon className="h-4 w-4" />
          </ActionIcon>
        </Tooltip>
      </div>

      {/* Column Content - This entire area is droppable */}
      <div className="flex-1 overflow-y-auto p-3">
        <SortableContext
          id={column.id}
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.length > 0 ? (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <KanbanCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-md border-2 border-dashed border-gray-300/70 bg-white/50 text-sm text-gray-400 dark:border-gray-700/60 dark:bg-gray-900/20">
              Drop here
            </div>
          )}
        </SortableContext>
      </div>

      <WhatsAppSendModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        status={column.status}
      />
    </div>
  );
}
