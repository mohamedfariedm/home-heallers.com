'use client';

import { useMemo } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PiXBold } from 'react-icons/pi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import { Title } from '@/components/ui/text';
import FormGroup from '@/app/shared/form-group';
import SelectBox from '@/components/ui/select';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  useCreateScheduledNotification,
  useUpdateScheduledNotification,
} from '@/framework/notifications';
import { usePatients } from '@/framework/patients';
import { useDoctors } from '@/framework/doctors';
import NotificationContentFields from '@/app/shared/notifications/notification-content-fields';
import {
  AUDIENCE_OPTIONS,
  RECIPIENT_KIND_OPTIONS,
} from '@/app/shared/notifications/constants';
import {
  buildNotificationPayload,
  scheduledNotificationSchema,
  type ScheduledNotificationInput,
} from '@/utils/validators/notification-form.schema';
import type { ScheduledNotification } from '@/types/admin-notifications';

function toDatetimeLocalValue(value?: string | null) {
  if (!value) return '';
  const date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return '';
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toApiDatetime(value: string) {
  const date = new Date(value);
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export default function ScheduledNotificationForm({
  initValues,
}: {
  initValues?: ScheduledNotification;
}) {
  const { closeModal } = useModal();
  const { mutate: create, isPending: isCreating } = useCreateScheduledNotification();
  const { mutate: update, isPending: isUpdating } = useUpdateScheduledNotification();

  const { data: clientsData, isLoading: clientsLoading } = usePatients('limit=500');
  const { data: doctorsData, isLoading: doctorsLoading } = useDoctors('limit=500');

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<ScheduledNotificationInput>({
    resolver: zodResolver(scheduledNotificationSchema),
    defaultValues: {
      title: initValues?.title ?? '',
      body: initValues?.body ?? '',
      lang: initValues?.lang ?? 'en',
      type: initValues?.type ?? '',
      deep_link: initValues?.deep_link ?? '',
      url: initValues?.url ?? '',
      extra_data_json: initValues?.extra_data
        ? JSON.stringify(initValues.extra_data, null, 2)
        : '',
      recipient_type: initValues?.recipient_type ?? 'clients',
      recipient_kind: 'client',
      recipient_id: initValues?.recipient_id ?? undefined,
      scheduled_at: toDatetimeLocalValue(initValues?.scheduled_at),
    },
  });

  const recipientType = watch('recipient_type');
  const recipientKind = watch('recipient_kind') ?? 'client';

  const recipientOptions = useMemo(() => {
    const source =
      recipientKind === 'doctor' ? doctorsData?.data ?? [] : clientsData?.data ?? [];

    return source.map((item: { id: number; name?: { en?: string; ar?: string } | string }) => {
      const label =
        typeof item.name === 'string'
          ? item.name
          : item.name?.en || item.name?.ar || `#${item.id}`;
      return { value: item.id, name: String(item.id), label };
    }) as Array<{ value: number; name: string; label: string }>;
  }, [clientsData?.data, doctorsData?.data, recipientKind]);

  const onSubmit: SubmitHandler<ScheduledNotificationInput> = (data) => {
    const payload = {
      ...buildNotificationPayload({
        ...data,
        recipient_id:
          data.recipient_type === 'specific' ? Number(data.recipient_id) : undefined,
      }),
      recipient_type: data.recipient_type,
      scheduled_at: toApiDatetime(data.scheduled_at),
    };

    if (initValues?.id) {
      update({ id: initValues.id, payload });
      return;
    }

    create(payload);
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-grow flex-col gap-5 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
    >
      <div className="flex items-center justify-between">
        <Title as="h4" className="font-semibold">
          {initValues ? 'Edit scheduled notification' : 'Schedule notification'}
        </Title>
        <ActionIcon size="sm" variant="text" onClick={closeModal}>
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>

      <FormGroup title="Audience">
        <Controller
          control={control}
          name="recipient_type"
          render={({ field: { value, onChange } }) => (
            <SelectBox
              placeholder="Audience"
              options={AUDIENCE_OPTIONS.map((option) => ({
                ...option,
                name: option.value,
              }))}
              value={value}
              onChange={onChange}
              getOptionValue={(option) => option.value}
              displayValue={(selected) =>
                AUDIENCE_OPTIONS.find((option) => option.value === selected)?.label ??
                String(selected)
              }
              error={errors.recipient_type?.message as string}
            />
          )}
        />
      </FormGroup>

      {recipientType === 'specific' && (
        <div className="grid gap-4 @xl:grid-cols-2">
          <FormGroup title="User type">
            <Controller
              control={control}
              name="recipient_kind"
              render={({ field: { value, onChange } }) => (
                <SelectBox
                  placeholder="User type"
                  options={RECIPIENT_KIND_OPTIONS.map((option) => ({
                    ...option,
                    name: option.value,
                  }))}
                  value={value}
                  onChange={onChange}
                  getOptionValue={(option) => String(option.value)}
                  displayValue={(selected) =>
                    RECIPIENT_KIND_OPTIONS.find((option) => option.value === selected)
                      ?.label ?? String(selected)
                  }
                />
              )}
            />
          </FormGroup>

          <FormGroup title="Recipient">
            <Controller
              control={control}
              name="recipient_id"
              render={({ field: { value, onChange } }) => (
                <SelectBox
                  placeholder={
                    recipientKind === 'doctor'
                      ? doctorsLoading
                        ? 'Loading doctors...'
                        : 'Select doctor'
                      : clientsLoading
                        ? 'Loading clients...'
                        : 'Select client'
                  }
                  options={recipientOptions}
                  value={value ? String(value) : ''}
                  onChange={(next) => onChange(next ? Number(next) : undefined)}
                  getOptionValue={(option) => String(option.value)}
                  displayValue={(selected) =>
                    recipientOptions.find(
                      (item) => String(item.value) === String(selected)
                    )?.label ?? String(selected)
                  }
                  error={errors.recipient_id?.message as string}
                />
              )}
            />
          </FormGroup>
        </div>
      )}

      <Input
        label="Scheduled at"
        type="datetime-local"
        {...register('scheduled_at')}
        error={errors.scheduled_at?.message}
      />

      <NotificationContentFields register={register} control={control} errors={errors} />

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={closeModal}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isCreating || isUpdating}>
          {initValues ? 'Save changes' : 'Schedule notification'}
        </Button>
      </div>
    </form>
  );
}
