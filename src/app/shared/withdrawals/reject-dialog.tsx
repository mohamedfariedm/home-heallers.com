'use client';

import { PiXBold } from 'react-icons/pi';
import type { SubmitHandler } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import { Textarea } from '@/components/ui/textarea';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  withdrawalRejectSchema,
  type WithdrawalRejectInput,
} from '@/utils/validators/doctor-targets-form.schema';
import { useRejectWithdrawal } from '@/framework/withdrawals';

export default function RejectWithdrawalDialog({
  withdrawal,
}: {
  withdrawal: any;
}) {
  const { closeModal } = useModal();
  const { mutate, isPending } = useRejectWithdrawal();

  const onSubmit: SubmitHandler<WithdrawalRejectInput> = (data) => {
    mutate({
      id: withdrawal.id,
      rejection_reason: data.rejection_reason.trim(),
    });
  };

  return (
    <Form<WithdrawalRejectInput>
      onSubmit={onSubmit}
      validationSchema={withdrawalRejectSchema}
      useFormProps={{
        defaultValues: { rejection_reason: '' },
      }}
      className="flex flex-col gap-5 p-6"
    >
      {({ register, formState: { errors } }) => (
        <>
          <div className="flex items-center justify-between">
            <div>
              <Title as="h4" className="font-semibold">
                Reject withdrawal
              </Title>
              <Text className="mt-1 text-sm text-gray-500">
                Wallet balance is not reduced on reject.
              </Text>
            </div>
            <ActionIcon size="sm" variant="text" onClick={closeModal}>
              <PiXBold className="h-auto w-5" />
            </ActionIcon>
          </div>

          <Textarea
            label="Rejection reason (required)"
            {...register('rejection_reason')}
            error={errors.rejection_reason?.message}
          />

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" color="danger" isLoading={isPending}>
              Reject
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
