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
  doctorTargetEditSchema,
  type DoctorTargetEditInput,
} from '@/utils/validators/doctor-targets-form.schema';
import { useUpdateDoctorTarget } from '@/framework/doctor-targets';
import { isFrozenStatus } from './permissions';
import { doctorDisplayName } from './status-badge';
import DateInput from './date-input';
import { Controller } from 'react-hook-form';

export default function EditDoctorTargetForm({
  initValues,
}: {
  initValues: any;
}) {
  const { closeModal } = useModal();
  const { mutate, isPending } = useUpdateDoctorTarget();

  if (isFrozenStatus(initValues?.status)) {
    return (
      <div className="p-6">
        <Title as="h4" className="font-semibold">
          Editing locked
        </Title>
        <Text className="mt-2 text-sm text-gray-600">
          Approved / paid targets cannot change required sessions, dates,
          incentive, or progress fields.
        </Text>
        <Button className="mt-4" variant="outline" onClick={closeModal}>
          Close
        </Button>
      </div>
    );
  }

  const onSubmit: SubmitHandler<DoctorTargetEditInput> = (data) => {
    mutate({
      id: initValues.id,
      start_date: data.start_date,
      end_date: data.end_date,
      required_sessions: Number(data.required_sessions),
      incentive_amount: Number(data.incentive_amount),
      notes: data.notes || null,
    });
  };

  return (
    <Form<DoctorTargetEditInput>
      onSubmit={onSubmit}
      validationSchema={doctorTargetEditSchema}
      useFormProps={{
        defaultValues: {
          start_date: initValues?.start_date?.slice?.(0, 10) || '',
          end_date: initValues?.end_date?.slice?.(0, 10) || '',
          required_sessions: initValues?.required_sessions ?? 1,
          incentive_amount: initValues?.incentive_amount ?? 0,
          notes: initValues?.notes ?? '',
        },
      }}
      className="flex flex-grow flex-col gap-5 p-6"
    >
      {({ register, formState: { errors }, control }) => (
        <>
          <div className="flex items-center justify-between">
            <div>
              <Title as="h4" className="font-semibold">
                Edit target #{initValues?.id}
              </Title>
              <Text className="mt-1 text-sm text-gray-500">
                {doctorDisplayName(initValues?.doctor, initValues?.doctor_id)}
              </Text>
            </div>
            <ActionIcon size="sm" variant="text" onClick={closeModal}>
              <PiXBold className="h-auto w-5" />
            </ActionIcon>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="start_date"
              control={control}
              render={({ field: { value, onChange } }) => (
                <DateInput
                  label="Start date"
                  value={value}
                  onChange={onChange}
                  error={errors.start_date?.message}
                />
              )}
            />
            <Controller
              name="end_date"
              control={control}
              render={({ field: { value, onChange } }) => (
                <DateInput
                  label="End date"
                  value={value}
                  onChange={onChange}
                  error={errors.end_date?.message}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              type="number"
              label="Required sessions"
              {...register('required_sessions')}
              error={errors.required_sessions?.message}
            />
            <Input
              type="number"
              step="0.01"
              label="Incentive amount"
              {...register('incentive_amount')}
              error={errors.incentive_amount?.message}
            />
          </div>

          <Textarea
            label="Notes (optional)"
            {...register('notes')}
            error={errors.notes?.message}
          />

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              Save changes
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
