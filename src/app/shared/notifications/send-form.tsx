'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PiXBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import { Title } from '@/components/ui/text';
import FormGroup from '@/app/shared/form-group';
import SelectBox from '@/components/ui/select';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useSendNotification } from '@/framework/notifications';
import NotificationContentFields from '@/app/shared/notifications/notification-content-fields';
import SpecificRecipientsPicker from '@/app/shared/notifications/specific-recipients-picker';
import { AUDIENCE_OPTIONS } from '@/app/shared/notifications/constants';
import {
  buildNotificationPayload,
  sendNotificationSchema,
  type SendNotificationInput,
} from '@/utils/validators/notification-form.schema';
import { routes } from '@/config/routes';

export default function SendNotificationForm() {
  const { closeModal } = useModal();
  const pathname = usePathname();
  const localePrefix = `/${pathname.split('/')[1] || 'en'}`;
  const { mutate: send, isPending } = useSendNotification();
  const [lastResult, setLastResult] = useState<{
    logId: number;
    queuedCount: number;
    recipientCount?: number;
  } | null>(null);

  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<SendNotificationInput>({
    resolver: zodResolver(sendNotificationSchema),
    defaultValues: {
      title: '',
      body: '',
      lang: 'en',
      type: '',
      deep_link: '',
      url: '',
      extra_data_json: '',
      audience: 'clients',
      recipients: [],
    },
  });

  const audience = watch('audience');

  const onSubmit: SubmitHandler<SendNotificationInput> = (data) => {
    const payload = buildNotificationPayload({
      ...data,
      recipients: data.audience === 'specific' ? data.recipients : undefined,
    });

    send(
      { audience: data.audience, payload },
      {
        onSuccess: (result) => {
          const logId = result?.data?.log_id;
          if (!logId) return;
          setLastResult({
            logId,
            queuedCount: result?.data?.queued_count ?? 0,
            recipientCount: result?.data?.recipient_count,
          });
        },
      }
    );
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-grow flex-col gap-5 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
    >
      <div className="flex items-center justify-between">
        <Title as="h4" className="font-semibold">
          Send notification now
        </Title>
        <ActionIcon size="sm" variant="text" onClick={closeModal}>
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>

      <FormGroup title="Audience">
        <Controller
          control={control}
          name="audience"
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
              error={errors.audience?.message as string}
            />
          )}
        />
      </FormGroup>

      {audience === 'specific' && (
        <Controller
          control={control}
          name="recipients"
          render={({ field: { value, onChange } }) => (
            <SpecificRecipientsPicker
              value={value ?? []}
              onChange={onChange}
              error={errors.recipients?.message as string}
            />
          )}
        />
      )}

      <NotificationContentFields
        register={register}
        control={control}
        errors={errors}
        watch={watch}
        setValue={setValue}
      />

      {lastResult?.logId ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Queued {lastResult.queuedCount} job
          {lastResult.queuedCount === 1 ? '' : 's'}
          {lastResult.recipientCount != null
            ? ` for ${lastResult.recipientCount} recipient${lastResult.recipientCount === 1 ? '' : 's'}`
            : ''}
          .{' '}
          <Link
            href={`${localePrefix}${routes.notifications.sentDetail(lastResult.logId)}`}
            className="font-medium underline"
            onClick={closeModal}
          >
            View sent history #{lastResult.logId}
          </Link>
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={closeModal}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending}>
          Queue notification
        </Button>
      </div>
    </form>
  );
}
