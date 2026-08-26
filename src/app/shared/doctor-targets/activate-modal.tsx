'use client';

import { PiXBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useActivateDoctorTarget } from '@/framework/doctor-targets';
import TargetStatusBadge, {
  doctorDisplayName,
  formatMoney,
} from './status-badge';

export default function ActivateDoctorTargetModal({
  target,
}: {
  target: any;
}) {
  const { closeModal } = useModal();
  const { mutate, isPending } = useActivateDoctorTarget();

  const handleActivate = () => {
    mutate(target.id);
  };

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Title as="h4" className="font-semibold">
            Activate target
          </Title>
          <Text className="mt-1 text-sm text-gray-500">
            This Draft will become Active. Sessions will start counting toward
            the target.
          </Text>
        </div>
        <ActionIcon size="sm" variant="text" onClick={closeModal}>
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>

      <div className="space-y-3 rounded-md border border-gray-200 p-4 text-sm dark:border-gray-700">
        <div className="flex items-center justify-between gap-2">
          <Text className="text-gray-500">Target</Text>
          <Text className="font-medium">#{target?.id}</Text>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Text className="text-gray-500">Doctor</Text>
          <Text className="font-medium">
            {doctorDisplayName(target?.doctor, target?.doctor_id)}
          </Text>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Text className="text-gray-500">Dates</Text>
          <Text className="font-medium">
            {target?.start_date?.slice?.(0, 10) || '—'} →{' '}
            {target?.end_date?.slice?.(0, 10) || '—'}
          </Text>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Text className="text-gray-500">Required sessions</Text>
          <Text className="font-medium">
            {target?.required_sessions ?? '—'}
          </Text>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Text className="text-gray-500">Incentive</Text>
          <Text className="font-medium">
            {formatMoney(target?.incentive_amount)}
          </Text>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Text className="text-gray-500">Status</Text>
          <TargetStatusBadge status={target?.status} />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={closeModal}>
          Cancel
        </Button>
        <Button isLoading={isPending} onClick={handleActivate}>
          Activate
        </Button>
      </div>
    </div>
  );
}
