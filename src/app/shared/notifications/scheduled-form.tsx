'use client';

import { useMemo } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
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
import NotificationContentFields from '@/app/shared/notifications/notification-content-fields';
import SpecificRecipientsPicker, {
  recipientsFromLegacy,
} from '@/app/shared/notifications/specific-recipients-picker';
import {
  AUDIENCE_OPTIONS,
  isDeepLinkEntityType,
} from '@/app/shared/notifications/constants';
import {
  buildNotificationPayload,
  createScheduledNotificationSchema,
  type ScheduledNotificationInput,
} from '@/utils/validators/notification-form.schema';
import type { ScheduledNotification } from '@/types/admin-notifications';

function toDatetimeLocalValue(value?: string | null) {
  if (!value) return '';
  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toApiDatetime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** Normalize stored deep_link (id, path, or URL) to the entity id used by the picker. */
function normalizeDeepLinkId(
  deepLink?: string | null,
  url?: string | null,
  type?: string | null
) {
  const candidates = [deepLink, url]
    .map((value) => String(value ?? '').trim())
    .filter(Boolean);

  for (const raw of candidates) {
    if (/^\d+$/.test(raw)) return raw;

    const pathMatch = raw.match(/\/(\d+)\/?(?:\?.*)?$/);
    if (pathMatch) return pathMatch[1];

    if (type && isDeepLinkEntityType(type)) {
      const prefix =
        type === 'coupon' ? 'coupons' : type === 'doctors' ? 'doctors' : type;
      const typedMatch = raw.match(new RegExp(`${prefix}\\/(\\d+)`, 'i'));
      if (typedMatch) return typedMatch[1];
    }
  }

  return String(deepLink ?? '').trim();
}

function serializeExtraData(extraData: unknown) {
  if (!extraData || typeof extraData !== 'object' || Array.isArray(extraData)) {
    return '';
  }
  if (Object.keys(extraData as object).length === 0) return '';
  return JSON.stringify(extraData, null, 2);
}

function firstErrorMessage(errors: Record<string, unknown>): string {
  for (const value of Object.values(errors)) {
    if (!value || typeof value !== 'object') continue;
    const message = (value as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
    const nested = firstErrorMessage(value as Record<string, unknown>);
    if (nested) return nested;
  }
  return 'Please fix the form errors';
}

export default function ScheduledNotificationForm({
  initValues,
}: {
  initValues?: ScheduledNotification;
}) {
  const { closeModal } = useModal();
  const { mutate: create, isPending: isCreating } = useCreateScheduledNotification();
  const { mutate: update, isPending: isUpdating } = useUpdateScheduledNotification();
  const isEdit = Boolean(initValues?.id);

  const schema = useMemo(
    () => createScheduledNotificationSchema({ requireFuture: !isEdit }),
    [isEdit]
  );

  const audienceValues = AUDIENCE_OPTIONS.map((option) => option.value);
  const recipientType = audienceValues.includes(
    initValues?.recipient_type as (typeof audienceValues)[number]
  )
    ? (initValues!.recipient_type as ScheduledNotificationInput['recipient_type'])
    : 'clients';

  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<ScheduledNotificationInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initValues?.title ?? '',
      body: initValues?.body ?? '',
      lang: initValues?.lang === 'ar' ? 'ar' : 'en',
      type: initValues?.type ?? '',
      deep_link: normalizeDeepLinkId(
        initValues?.deep_link,
        initValues?.url,
        initValues?.type
      ),
      url: initValues?.url ?? '',
      extra_data_json: serializeExtraData(initValues?.extra_data),
      recipient_type: recipientType,
      recipients: recipientsFromLegacy(initValues).filter(
        (item) =>
          (item.type === 'client' || item.type === 'doctor') &&
          Number(item.id) > 0
      ),
      scheduled_at: toDatetimeLocalValue(initValues?.scheduled_at),
    },
  });

  const watchedRecipientType = watch('recipient_type');

  const onSubmit: SubmitHandler<ScheduledNotificationInput> = (data) => {
    const payload = {
      ...buildNotificationPayload({
        ...data,
        recipients:
          data.recipient_type === 'specific'
            ? data.recipients
                ?.filter(
                  (item) =>
                    (item.type === 'client' || item.type === 'doctor') &&
                    Number(item.id) > 0
                )
                .map((item) => ({
                  type: item.type as 'client' | 'doctor',
                  id: Number(item.id),
                }))
            : undefined,
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
      onSubmit={handleSubmit(onSubmit, (formErrors) => {
        toast.error(firstErrorMessage(formErrors as Record<string, unknown>));
      })}
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

      {watchedRecipientType === 'specific' && (
        <Controller
          control={control}
          name="recipients"
          render={({ field: { value, onChange } }) => (
            <SpecificRecipientsPicker
              value={(value as ScheduledNotificationInput['recipients']) ?? []}
              onChange={onChange}
              error={errors.recipients?.message as string}
            />
          )}
        />
      )}

      <Input
        label="Scheduled at"
        type="datetime-local"
        {...register('scheduled_at')}
        error={errors.scheduled_at?.message}
      />

      <NotificationContentFields
        register={register}
        control={control}
        errors={errors}
        watch={watch}
        setValue={setValue}
      />

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={closeModal}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isCreating || isUpdating}>
          {initValues ? 'Save changes' : 'Schedule notification'}
        </Button>
      </div>
    </form>
  );
}
