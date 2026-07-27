'use client';

import { useMemo } from 'react';
import { PiXBold } from 'react-icons/pi';
import type { SubmitHandler } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import { Textarea } from '@/components/ui/textarea';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  doctorTargetCreateSchema,
  type DoctorTargetCreateInput,
} from '@/utils/validators/doctor-targets-form.schema';
import { useCreateDoctorTargets } from '@/framework/doctor-targets';
import { useDoctors } from '@/framework/doctors';
import SelectBox, { type SelectOption } from '@/components/ui/select';
import DateInput from './date-input';

export default function CreateDoctorTargetsForm() {
  const { closeModal } = useModal();
  const { mutate, isPending } = useCreateDoctorTargets();
  const { data: doctorsRes, isLoading: doctorsLoading } = useDoctors(
    'page=1&limit=500'
  );

  const doctorOptions: SelectOption[] = useMemo(() => {
    const list = doctorsRes?.data;
    if (!Array.isArray(list)) return [];
    return list.map((d: any) => {
      const label =
        d?.name?.en || d?.name?.ar || d?.email || `Doctor #${d.id}`;
      return { value: String(d.id), name: label, label };
    });
  }, [doctorsRes?.data]);

  const onSubmit: SubmitHandler<DoctorTargetCreateInput> = (data) => {
    mutate({
      doctor_ids: data.doctor_ids.map(Number),
      start_date: data.start_date,
      end_date: data.end_date,
      required_sessions: Number(data.required_sessions),
      incentive_amount: Number(data.incentive_amount),
      notes: data.notes || null,
    });
  };

  return (
    <Form<DoctorTargetCreateInput>
      onSubmit={onSubmit}
      validationSchema={doctorTargetCreateSchema}
      useFormProps={{
        defaultValues: {
          doctor_ids: [],
          start_date: '',
          end_date: '',
          required_sessions: 20,
          incentive_amount: 0,
          notes: '',
        },
      }}
      className="flex flex-grow flex-col gap-5 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
    >
      {({ register, formState: { errors }, control }) => (
        <>
          <div className="flex items-center justify-between">
            <div>
              <Title as="h4" className="font-semibold">
                Create doctor target(s)
              </Title>
              <Text className="mt-1 text-sm text-gray-500">
                One Draft row is created per selected doctor.
              </Text>
            </div>
            <ActionIcon size="sm" variant="text" onClick={closeModal}>
              <PiXBold className="h-auto w-5" />
            </ActionIcon>
          </div>

          <Controller
            name="doctor_ids"
            control={control}
            render={({ field: { value, onChange } }) => {
              const selectedOptions = Array.isArray(value)
                ? doctorOptions.filter((opt) =>
                    value.includes(String(opt.value))
                  )
                : [];

              return (
                <SelectBox
                  multiple
                  options={doctorOptions}
                  value={selectedOptions}
                  onChange={(opts: SelectOption[] | SelectOption) => {
                    const ids = Array.isArray(opts)
                      ? opts.map((o) => String(o.value))
                      : opts
                        ? [String((opts as SelectOption).value)]
                        : [];
                    onChange(ids);
                  }}
                  disabled={doctorsLoading}
                  label="Doctors"
                  placeholder="Select doctors"
                  error={(errors.doctor_ids as any)?.message}
                  displayValue={(val: any) => {
                    if (Array.isArray(val)) {
                      if (val.length === 0) return '';
                      return val
                        .map((o: any) => o?.label ?? o?.name ?? o?.value)
                        .join(', ');
                    }
                    return val?.label ?? val?.name ?? val ?? '';
                  }}
                />
              );
            }}
          />

          <div className="grid grid-cols-1 gap-4 @md:grid-cols-2">
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

          <div className="grid grid-cols-1 gap-4 @md:grid-cols-2">
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

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              Create Draft target(s)
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
