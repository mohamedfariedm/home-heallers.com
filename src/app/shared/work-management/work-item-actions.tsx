'use client';

import { ActionIcon } from '@/components/ui/action-icon';
import { Tooltip } from '@/components/ui/tooltip';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { PiEye, PiPencilSimpleBold } from 'react-icons/pi';
import type {
  Department,
  Project,
  WorkItem,
  WmUser,
} from '@/types/work-management';
import WorkItemForm from './work-item-form';
import WorkItemViewModal from './work-item-view-modal';

export function WorkItemRowActions({
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
  const { openModal } = useModal();

  return (
    <div className="flex items-center justify-end gap-2">
      <Tooltip size="sm" content={() => 'View'} placement="top" color="invert">
        <ActionIcon
          size="sm"
          variant="outline"
          onClick={() =>
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
            })
          }
        >
          <PiEye className="h-4 w-4" />
        </ActionIcon>
      </Tooltip>
      <Tooltip size="sm" content={() => 'Edit'} placement="top" color="invert">
        <ActionIcon
          size="sm"
          variant="outline"
          onClick={() =>
            openModal({
              view: <WorkItemForm initValues={item} />,
              customSize: '720px',
            })
          }
        >
          <PiPencilSimpleBold className="h-4 w-4" />
        </ActionIcon>
      </Tooltip>
    </div>
  );
}
