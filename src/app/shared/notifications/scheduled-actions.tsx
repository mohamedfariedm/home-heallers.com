'use client';

import { ActionIcon } from '@/components/ui/action-icon';
import PencilIcon from '@/components/icons/pencil';
import TrashIcon from '@/components/icons/trash';
import { useModal } from '@/app/shared/modal-views/use-modal';
import ScheduledNotificationForm from '@/app/shared/notifications/scheduled-form';
import type { ScheduledNotification } from '@/types/admin-notifications';

export function ScheduledRowActions({
  row,
  onCancel,
  isCanceling,
}: {
  row: ScheduledNotification;
  onCancel: (id: number) => void;
  isCanceling: boolean;
}) {
  const { openModal } = useModal();

  if (row.status !== 'pending') {
    return <span className="text-xs text-gray-500">—</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <ActionIcon
        size="sm"
        variant="outline"
        onClick={() =>
          openModal({
            view: <ScheduledNotificationForm initValues={row} />,
            customSize: '760px',
          })
        }
      >
        <PencilIcon className="h-4 w-4" />
      </ActionIcon>
      <ActionIcon
        size="sm"
        variant="outline"
        className="hover:border-red-500 hover:text-red-500"
        disabled={isCanceling}
        onClick={() => onCancel(row.id)}
      >
        <TrashIcon className="h-4 w-4" />
      </ActionIcon>
    </div>
  );
}
