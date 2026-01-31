'use client';
import { useState } from 'react';
import { ActionIcon } from '@/components/ui/action-icon';
import { Tooltip } from '@/components/ui/tooltip';
import UserPlusIcon from '@/components/icons/user-plus';
import InviteDoctorsModal from './invite-doctors-modal';

interface InviteDoctorsButtonProps {
  reservationId: number;
}

export default function InviteDoctorsButton({
  reservationId,
}: InviteDoctorsButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Tooltip
        size="sm"
        content={() => 'Invite Doctors'}
        placement="top"
        color="invert"
      >
        <ActionIcon
          size="sm"
          variant="outline"
          className="cursor-pointer hover:text-gray-700"
          onClick={() => setIsModalOpen(true)}
        >
          <UserPlusIcon className="h-4 w-4" />
        </ActionIcon>
      </Tooltip>

      <InviteDoctorsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reservationId={reservationId}
      />
    </>
  );
}
