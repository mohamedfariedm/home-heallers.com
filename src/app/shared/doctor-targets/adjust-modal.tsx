'use client';

import { PiXBold } from 'react-icons/pi';
import type { SubmitHandler } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import { Textarea } from '@/components/ui/textarea';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  doctorTargetAdjustSchema,
  type DoctorTargetAdjustInput,
} from '@/utils/validators/doctor-targets-form.schema';
import { useAdjustDoctorTarget } from '@/framework/doctor-targets';

export default function AdjustSessionsModal({ target }: { target: any }) {
  const { closeModal } = useModal();
  const { mutate, isPending } = useAdjustDoctorTarget();

  const onSubmit: SubmitHandler<DoctorTargetAdjustInput> = (data) => {
    mutate({
      id: target.id,
      completed_sessions: Number(data.completed_sessions),
      reason: data.reason.trim(),
    });
  };

  return (
    <Form<DoctorTargetAdjustInput>
      onSubmit={onSubmit}
      validationSchema={doctorTargetAdjustSchema}
      useFormProps={{
        defaultValues: {
          completed_sessions: target?.completed_sessions ?? 0,
          reason: '',
        },
      }}
      className="flex flex-col gap-5 p-6"
    >
      {({ register, formState: { errors }, watch }) => {
        const next = Number(watch('completed_sessions'));
        return (
          <>
            <div className="flex items-center justify-between">
              <Title as="h4" className="font-semibold">
                Adjust completed sessions
              </Title>
              <ActionIcon size="sm" variant="text" onClick={closeModal}>
                <PiXBold className="h-auto w-5" />
              </ActionIcon>
            </div>

            <Text className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
              Current completed: <strong>{target?.completed_sessions ?? 0}</strong>
              {' → '}
              New value: <strong>{Number.isFinite(next) ? next : '—'}</strong>
            </Text>

            <Input
              type="number"
              label="Completed sessions"
              {...register('completed_sessions')}
              error={errors.completed_sessions?.message}
            />

            <Textarea
              label="Reason (required)"
              placeholder="e.g. Session marked completed offline"
              {...register('reason')}
              error={errors.reason?.message}
            />

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isPending}>
                Confirm adjustment
              </Button>
            </div>
          </>
        );
      }}
    </Form>
  );
}
