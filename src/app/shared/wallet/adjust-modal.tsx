'use client';

import { useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import type { SubmitHandler } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { formatMoney } from '@/app/shared/doctor-targets/status-badge';
import {
  walletAdjustSchema,
  type WalletAdjustInput,
} from '@/utils/validators/wallet-adjust.schema';
import { useWalletAdjust, type WalletOwner } from '@/framework/wallet';

function newIdempotencyKey() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export default function WalletAdjustModal({
  owner,
  ownerId,
  ownerName,
  kind,
  balance,
}: {
  owner: WalletOwner;
  ownerId: number | string;
  ownerName?: string;
  kind: 'deposit' | 'withdraw';
  balance: number;
}) {
  const { closeModal } = useModal();
  const { mutate, isPending } = useWalletAdjust(owner, ownerId);
  // One key per opened modal: a double-click or retry can never apply the adjustment twice.
  const [idempotencyKey] = useState(newIdempotencyKey);
  const isDeposit = kind === 'deposit';

  const onSubmit: SubmitHandler<WalletAdjustInput> = (data) => {
    mutate({
      owner,
      id: ownerId,
      kind,
      amount: data.amount,
      reason: data.reason.trim(),
      idempotency_key: idempotencyKey,
    });
  };

  return (
    <Form<WalletAdjustInput>
      onSubmit={onSubmit}
      validationSchema={walletAdjustSchema}
      useFormProps={{
        defaultValues: { reason: '', confirmed: false as unknown as true },
      }}
      className="flex flex-col gap-5 p-6"
    >
      {({ register, watch, setValue, formState: { errors } }) => {
        const amount = Number(watch('amount')) || 0;
        const exceeds = !isDeposit && amount > balance;
        const after = isDeposit ? balance + amount : balance - amount;

        return (
          <>
            <div className="flex items-center justify-between">
              <div>
                <Title as="h4" className="font-semibold">
                  {isDeposit ? 'Deposit to wallet' : 'Withdraw from wallet'}
                </Title>
                <Text className="mt-1 text-sm text-gray-500">
                  {ownerName ? `${ownerName} · ` : ''}
                  {owner === 'doctors' ? 'Doctor' : 'Client'} #{ownerId}
                </Text>
              </div>
              <ActionIcon size="sm" variant="text" onClick={closeModal}>
                <PiXBold className="h-auto w-5" />
              </ActionIcon>
            </div>

            <div className="rounded-md border border-gray-200 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Current balance</span>
                <span className="font-medium">{formatMoney(balance)} SAR</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-gray-500">Balance after</span>
                <span
                  className={`font-medium ${exceeds ? 'text-red-600' : ''}`}
                >
                  {amount > 0 ? `${formatMoney(after)} SAR` : '—'}
                </span>
              </div>
            </div>

            <Input
              type="number"
              step="0.01"
              min="0"
              label="Amount (SAR)"
              {...register('amount')}
              error={
                errors.amount?.message ||
                (exceeds ? 'Amount exceeds the current balance' : undefined)
              }
            />

            <Textarea
              label="Reason (required)"
              placeholder={
                isDeposit
                  ? 'e.g. Compensation for cancelled session'
                  : 'e.g. Correction of a duplicate credit'
              }
              {...register('reason')}
              error={errors.reason?.message}
            />

            <div>
              <Checkbox
                checked={!!watch('confirmed')}
                onChange={(e) =>
                  setValue('confirmed', e.target.checked as unknown as true, {
                    shouldValidate: true,
                  })
                }
                label={
                  isDeposit
                    ? 'I confirm this amount will be added to the wallet.'
                    : 'I confirm this amount will be deducted from the wallet.'
                }
              />
              {errors.confirmed?.message && (
                <Text className="mt-1 text-xs text-red-600">
                  {errors.confirmed.message}
                </Text>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                color={isDeposit ? 'primary' : 'danger'}
                isLoading={isPending}
                disabled={isPending || exceeds}
              >
                {isDeposit ? 'Deposit' : 'Withdraw'}
              </Button>
            </div>
          </>
        );
      }}
    </Form>
  );
}
