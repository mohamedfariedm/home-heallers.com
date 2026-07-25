'use client';

import { PiXBold } from 'react-icons/pi';
import type { SubmitHandler } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  doctorTargetRetargetSchema,
  type DoctorTargetRetargetInput,
} from '@/utils/validators/doctor-targets-form.schema';
import { useRetargetDoctorTarget } from '@/framework/doctor-targets';
import DateInput from './date-input';

export default function RetargetModal({ target }: { target: any }) {
  const { closeModal } = useModal();
  const { mutate, isPending } = useRetargetDoctorTarget();

  const onSubmit: SubmitHandler<DoctorTargetRetargetInput> = (data) => {
    mutate({
      id: target.id,
      start_date: data.start_date,
      end_date: data.end_date,
    });
  };

  return (
    <Form<DoctorTargetRetargetInput>
      onSubmit={onSubmit}
      validationSchema={doctorTargetRetargetSchema}
      useFormProps={{
        defaultValues: {
          start_date: '',
          end_date: '',
        },
      }}
      className="flex flex-col gap-5 p-6"
    >
      {({ formState: { errors }, control }) => (
        <>
          <div className="flex items-center justify-between">
            <div>
              <Title as="h4" className="font-semibold">
                Retarget
              </Title>
              <Text className="mt-1 text-sm text-gray-500">
                Creates a new Draft with new dates only. Progress and incentive
                are not copied.
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
                  label="New start date"
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
                  label="New end date"
                  value={value}
                  onChange={onChange}
                  error={errors.end_date?.message}
                />
              )}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              Create new Draft
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
