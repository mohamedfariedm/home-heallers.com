'use client';

import { useMemo } from 'react';
import { PiXBold } from 'react-icons/pi';
import type { SubmitHandler } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import { Title } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  groupFormSchema,
  type GroupFormInput,
} from '@/utils/validators/groups-form-schema';
import { useCreateGroup, useUpdateGroup } from '@/framework/groups';
import { useDoctors } from '@/framework/doctors';
import SelectBox, { type SelectOption } from '@/components/ui/select';

export default function GroupsForm({ initValues }: { initValues?: any }) {
  const { closeModal } = useModal();
  const { mutate: createGroup, isPending: isCreating } = useCreateGroup();
  const { mutate: updateGroup, isPending: isUpdating } = useUpdateGroup();
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

  const onSubmit: SubmitHandler<GroupFormInput> = (data) => {
    const doctor_ids = (data.doctor_ids || []).map((id) => Number(id));
    if (initValues?.id) {
      updateGroup({
        group_id: initValues.id,
        name: data.name,
        doctor_ids,
      });
    } else {
      createGroup({
        name: data.name,
        doctor_ids,
      });
    }
  };

  return (
    <Form<GroupFormInput>
      onSubmit={onSubmit}
      validationSchema={groupFormSchema}
      useFormProps={{
        defaultValues: {
          name: initValues?.name ?? '',
          doctor_ids: Array.isArray(initValues?.doctor_ids)
            ? initValues.doctor_ids.map(String)
            : Array.isArray(initValues?.doctors)
              ? initValues.doctors.map((d: { id: number }) => String(d.id))
              : [],
        },
      }}
      className="flex flex-grow flex-col gap-6 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
    >
      {({ register, formState: { errors }, control }) => (
        <>
          <div className="flex items-center justify-between">
            <Title as="h4" className="font-semibold">
              {initValues ? 'Update group' : 'Create group'}
            </Title>
            <ActionIcon size="sm" variant="text" onClick={closeModal}>
              <PiXBold className="h-auto w-5" />
            </ActionIcon>
          </div>

          <Input
            label="Group name"
            placeholder="e.g. Night shift"
            {...register('name')}
            error={errors.name?.message}
          />

          <Controller
            name="doctor_ids"
            control={control}
            render={({ field: { value, onChange } }) => {
              const selectedOptions =
                Array.isArray(value)
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
                  label="Doctors (optional)"
                  placeholder="Assign doctors"
                  error={(errors.doctor_ids as any)?.message}
                  displayValue={(val: any) => {
                    if (Array.isArray(val)) {
                      if (val.length === 0) return '';
                      return val
                        .map((o: any) => o?.label ?? o?.name ?? o?.value)
                        .join(', ');
                    }
                    if (val?.label) return val.label;
                    if (val?.name) return val.name;
                    return val ?? '';
                  }}
                />
              );
            }}
          />

          <div className="flex items-center justify-end gap-4">
            <Button
              variant="outline"
              onClick={closeModal}
              className="w-full @xl:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isCreating || isUpdating}
              className="w-full @xl:w-auto"
            >
              {initValues ? 'Update group' : 'Create group'}
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
