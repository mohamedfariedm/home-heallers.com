'use client';

import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
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
import { useSendNotification } from '@/framework/notifications';
import { usePatients } from '@/framework/patients';
import { useDoctors } from '@/framework/doctors';
import NotificationContentFields from '@/app/shared/notifications/notification-content-fields';
import {
  AUDIENCE_OPTIONS,
  RECIPIENT_KIND_OPTIONS,
} from '@/app/shared/notifications/constants';
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
  const [lastLogId, setLastLogId] = useState<number | null>(null);

  const { data: clientsData, isLoading: clientsLoading } = usePatients('limit=500');
  const { data: doctorsData, isLoading: doctorsLoading } = useDoctors('limit=500');

  const {
    register,
    control,
    watch,
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
      recipient_kind: 'client',
    },
  });

  const audience = watch('audience');
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

  const onSubmit: SubmitHandler<SendNotificationInput> = (data) => {
    const payload = buildNotificationPayload({
      ...data,
      recipient_id: data.audience === 'specific' ? Number(data.recipient_id) : undefined,
    });

    send(
      { audience: data.audience, payload },
      {
        onSuccess: (result) => {
          setLastLogId(result?.data?.log_id ?? null);
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

      <NotificationContentFields register={register} control={control} errors={errors} />

      {lastLogId ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          View in{' '}
          <Link
            href={`${localePrefix}${routes.notifications.sentDetail(lastLogId)}`}
            className="font-medium underline"
            onClick={closeModal}
          >
            sent history #{lastLogId}
          </Link>
          .
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
