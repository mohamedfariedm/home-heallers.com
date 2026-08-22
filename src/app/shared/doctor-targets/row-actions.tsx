'use client';

import Link from 'next/link';
import { ActionIcon } from '@/components/ui/action-icon';
import { Tooltip } from '@/components/ui/tooltip';
import { Dropdown, DropdownItem } from '@/components/ui/dropdown ';
import EyeIcon from '@/components/icons/eye';
import PencilIcon from '@/components/icons/pencil';
import CreateButton from '@/app/shared/create-button';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';
import { PiDotsThreeBold } from 'react-icons/pi';
import toast from 'react-hot-toast';
import EditDoctorTargetForm from './edit-form';
import AdjustSessionsModal from './adjust-modal';
import RetargetModal from './retarget-modal';
import ApprovePreviewModal from './approve-preview-modal';
import {
  getStatusActions,
  type DoctorTargetsPermissions,
} from './permissions';
import { useActivateDoctorTarget } from '@/framework/doctor-targets';

export default function DoctorTargetRowActions({
  row,
  permissions,
}: {
  row: any;
  permissions: DoctorTargetsPermissions;
}) {
  const { openModal } = useModal();
  const actions = getStatusActions(row?.status, permissions);
  const { mutate: activate, isPending: activating } = useActivateDoctorTarget();
  const hasMore =
    actions.activate || actions.adjust || actions.retarget || actions.preview;

  const handleActivate = () => {
    if (!window.confirm('Activate this Draft target?')) return;
    activate(row.id, {
      onError: (error) => toast.error(error?.message || 'Activate failed'),
    });
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Tooltip
        size="sm"
        content={() => 'View details'}
        placement="top"
        color="invert"
      >
        <Link
          href={routes.doctorTargets.detail(row.id)}
          className="m-0 bg-transparent p-0 text-gray-700"
        >
          <ActionIcon tag="span" size="sm" variant="outline" aria-label="View details">
            <EyeIcon className="h-4 w-4" />
          </ActionIcon>
        </Link>
      </Tooltip>

      {actions.edit && (
        <Tooltip size="sm" content={() => 'Edit'} placement="top" color="invert">
          <CreateButton
            icon={
              <ActionIcon tag="span" size="sm" variant="outline" aria-label="Edit">
                <PencilIcon className="h-4 w-4" />
              </ActionIcon>
            }
            view={<EditDoctorTargetForm initValues={row} />}
            label=""
            className="m-0 bg-transparent p-0 text-gray-700"
          />
        </Tooltip>
      )}

      {hasMore && (
        <Dropdown
          trigger={
            <ActionIcon
              size="sm"
              variant="outline"
              aria-label="More actions"
              disabled={activating}
            >
              <PiDotsThreeBold className="h-4 w-4" />
            </ActionIcon>
          }
          dropdownClassName="w-48 z-50 right-0 p-2 gap-1 grid mt-1"
        >
          {actions.activate && (
            <DropdownItem
              className="p-2 text-xs sm:text-sm"
              activeClassName="bg-gray-100 rounded-md"
              onClick={handleActivate}
            >
              Activate
            </DropdownItem>
          )}
          {actions.adjust && (
            <DropdownItem
              className="p-2 text-xs sm:text-sm"
              activeClassName="bg-gray-100 rounded-md"
              onClick={() =>
                openModal({
                  view: <AdjustSessionsModal target={row} />,
                })
              }
            >
              Adjust sessions
            </DropdownItem>
          )}
          {actions.retarget && (
            <DropdownItem
              className="p-2 text-xs sm:text-sm"
              activeClassName="bg-gray-100 rounded-md"
              onClick={() =>
                openModal({
                  view: <RetargetModal target={row} />,
                })
              }
            >
              Retarget
            </DropdownItem>
          )}
          {(actions.preview || actions.approve) && (
            <DropdownItem
              className="p-2 text-xs sm:text-sm"
              activeClassName="bg-gray-100 rounded-md"
              onClick={() =>
                openModal({
                  view: <ApprovePreviewModal targetId={row.id} />,
                  customSize: '560px',
                })
              }
            >
              Preview & approve
            </DropdownItem>
          )}
        </Dropdown>
      )}
    </div>
  );
}
