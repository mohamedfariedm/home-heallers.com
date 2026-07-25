'use client';

import { PiXBold } from 'react-icons/pi';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import { Checkbox } from '@/components/ui/checkbox';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useSettleWithdrawal } from '@/framework/withdrawals';
import { formatMoney } from '@/app/shared/doctor-targets/status-badge';

export default function SettleWithdrawalDialog({
  withdrawal,
}: {
  withdrawal: any;
}) {
  const { closeModal } = useModal();
  const [confirmed, setConfirmed] = useState(false);
  const { mutate, isPending } = useSettleWithdrawal();

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Title as="h4" className="font-semibold">
            Confirm external payment / Settle
          </Title>
          <Text className="mt-1 text-sm text-gray-500">
            The platform does not transfer bank funds. Settle only after the
            doctor was paid outside the platform.
          </Text>
        </div>
        <ActionIcon size="sm" variant="text" onClick={closeModal}>
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>

      <div className="rounded-md border border-gray-200 p-3 text-sm">
        <div>
          Request #{withdrawal?.id} · Doctor #{withdrawal?.doctor_id}
        </div>
        <div className="mt-1 font-medium">
          Amount: {formatMoney(withdrawal?.amount)}
        </div>
      </div>

      <Checkbox
        checked={confirmed}
        onChange={() => setConfirmed((v) => !v)}
        label="I confirm the doctor was paid outside the platform."
      />

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={closeModal}>
          Cancel
        </Button>
        <Button
          disabled={!confirmed}
          isLoading={isPending}
          onClick={() => mutate(withdrawal.id)}
        >
          Settle withdrawal
        </Button>
      </div>
    </div>
  );
}
