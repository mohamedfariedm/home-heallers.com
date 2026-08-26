'use client';

import Link from 'next/link';
import { ActionIcon } from '@/components/ui/action-icon';
import { Tooltip } from '@/components/ui/tooltip';
import { Popover } from '@/components/ui/popover';
import EyeIcon from '@/components/icons/eye';
import PencilIcon from '@/components/icons/pencil';
import CreateButton from '@/app/shared/create-button';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';
import { PiDotsThreeBold } from 'react-icons/pi';
import EditDoctorTargetForm from './edit-form';
import AdjustSessionsModal from './adjust-modal';
import RetargetModal from './retarget-modal';
import ApprovePreviewModal from './approve-preview-modal';
import ActivateDoctorTargetModal from './activate-modal';
import {
  getStatusActions,
  type DoctorTargetsPermissions,
} from './permissions';

export default function DoctorTargetRowActions({
  row,
  permissions,
}: {
  row: any;
  permissions: DoctorTargetsPermissions;
}) {
  const { openModal } = useModal();
  const actions = getStatusActions(row?.status, permissions);
  const hasMore =
    actions.activate || actions.adjust || actions.retarget || actions.preview;

  return (
    <div className="mx-auto inline-flex w-full items-center justify-center gap-2">
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
        <Popover
          placement="bottom"
          className="z-[60] p-1"
          content={({ setOpen }) => (
            <div className="flex min-w-[160px] flex-col gap-0.5">
              {actions.activate && (
                <button
                  type="button"
                  className="rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100"
                  onClick={() => {
                    setOpen(false);
                    openModal({
                      view: <ActivateDoctorTargetModal target={row} />,
                    });
                  }}
                >
                  Activate
                </button>
              )}
              {actions.adjust && (
                <button
                  type="button"
                  className="rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100"
                  onClick={() => {
                    setOpen(false);
                    openModal({
                      view: <AdjustSessionsModal target={row} />,
                    });
                  }}
                >
                  Adjust sessions
                </button>
              )}
              {actions.retarget && (
                <button
                  type="button"
                  className="rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100"
                  onClick={() => {
                    setOpen(false);
                    openModal({
                      view: <RetargetModal target={row} />,
                    });
                  }}
                >
                  Retarget
                </button>
              )}
              {(actions.preview || actions.approve) && (
                <button
                  type="button"
                  className="rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100"
                  onClick={() => {
                    setOpen(false);
                    openModal({
                      view: <ApprovePreviewModal targetId={row.id} />,
                      customSize: '560px',
                    });
                  }}
                >
                  Preview & approve
                </button>
              )}
            </div>
          )}
        >
          <ActionIcon
            size="sm"
            variant="outline"
            aria-label="More actions"
          >
            <PiDotsThreeBold className="h-4 w-4" />
          </ActionIcon>
        </Popover>
      )}
    </div>
  );
}
