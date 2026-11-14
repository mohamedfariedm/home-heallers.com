'use client';

import { useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { PiUsers, PiArticle, PiXBold } from 'react-icons/pi';
import { Input } from '@/components/ui/input';
import { ActionIcon } from 'rizzui';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';
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
import type {
  NotificationRecipientRef,
  ScheduledNotification,
} from '@/types/admin-notifications';
import cn from '@/utils/class-names';

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

type ScheduledTabId = 'audience' | 'content';

const SCHEDULED_TABS: {
  id: ScheduledTabId;
  label: string;
  icon: typeof PiUsers;
}[] = [
  { id: 'audience', label: 'Audience', icon: PiUsers },
  { id: 'content', label: 'Content', icon: PiArticle },
];

const AUDIENCE_ERROR_KEYS = [
  'recipient_type',
  'recipients',
  'scheduled_at',
];
const CONTENT_ERROR_KEYS = [
  'title',
  'body',
  'lang',
  'type',
  'deep_link',
  'url',
  'extra_data_json',
];

function scheduledTabHasErrors(
  tabId: ScheduledTabId,
  errors: FieldErrors<ScheduledNotificationInput> | Record<string, unknown>
): boolean {
  const has = (keys: string[]) =>
    keys.some((key) => Boolean((errors as Record<string, unknown>)?.[key]));

  switch (tabId) {
    case 'audience':
      return has(AUDIENCE_ERROR_KEYS);
    case 'content':
      return has(CONTENT_ERROR_KEYS);
    default:
      return false;
  }
}

export default function ScheduledNotificationForm({
  initValues,
}: {
  initValues?: ScheduledNotification;
}) {
  const { closeModal } = useModal();
  const { mutate: create, isPending: isCreating } =
    useCreateScheduledNotification();
  const { mutate: update, isPending: isUpdating } =
    useUpdateScheduledNotification();
  const isEdit = Boolean(initValues?.id);
  const [activeTab, setActiveTab] = useState(0);

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

  const onInvalid = (
    formErrors: FieldErrors<ScheduledNotificationInput>
  ) => {
    toast.error(firstErrorMessage(formErrors as Record<string, unknown>));
    const tabIndex = SCHEDULED_TABS.findIndex((tab) =>
      scheduledTabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(SCHEDULED_TABS.length - 1, index)));
  };

  const tabsWithErrors: ModalFormTabItem[] = SCHEDULED_TABS.map((tab) => ({
    ...tab,
    hasError: scheduledTabHasErrors(tab.id, errors),
  }));

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className={cn(
        modalFormTabsClassName,
        '@container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900'
      )}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
            <PiUsers className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900">
              {initValues
                ? 'Edit scheduled notification'
                : 'Schedule notification'}
            </h4>
            <p className="mt-0.5 text-xs text-gray-400">
              Fill each tab — save stays available on every step
            </p>
          </div>
        </div>
        <ActionIcon
          size="sm"
          variant="outline"
          onClick={closeModal}
          className="rounded-lg border-gray-200 text-gray-500 hover:border-[#143087]/40 hover:bg-blue-50 hover:text-[#143087]"
        >
          <PiXBold className="h-4 w-4" />
        </ActionIcon>
      </div>

      <ModalFormTabs
        tabs={tabsWithErrors}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        <ModalFormTabPanel>
          <div className="space-y-5">
            <ModalFormTabPanelCard
              title="Audience & schedule"
              description="Who receives this notification and when"
              contentClassName="sm:grid-cols-1"
            >
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
                      AUDIENCE_OPTIONS.find(
                        (option) => option.value === selected
                      )?.label ?? String(selected)
                    }
                    error={errors.recipient_type?.message as string}
                  />
                )}
              />

              {watchedRecipientType === 'guests' && (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Guests are anonymous app installs. They receive push only — no
                  in-app inbox or read tracking. Recipients are resolved at
                  dispatch time.
                </p>
              )}

              {watchedRecipientType === 'specific' && (
                <Controller
                  control={control}
                  name="recipients"
                  render={({ field: { value, onChange } }) => (
                    <SpecificRecipientsPicker
                      value={(value as NotificationRecipientRef[]) ?? []}
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
            </ModalFormTabPanelCard>
          </div>
        </ModalFormTabPanel>

        <ModalFormTabPanel>
          <div className="space-y-5">
            <ModalFormTabPanelCard
              title="Notification content"
              description="Message body and deep-link options"
              contentClassName="sm:grid-cols-1"
            >
              <NotificationContentFields
                register={register}
                control={control}
                errors={errors}
                watch={watch}
                setValue={setValue}
              />
            </ModalFormTabPanelCard>
          </div>
        </ModalFormTabPanel>
      </ModalFormTabs>

      <ModalFormTabsFooter
        activeTab={activeTab}
        tabCount={SCHEDULED_TABS.length}
        onPrev={() => goToTab(activeTab - 1)}
        onNext={() => goToTab(activeTab + 1)}
        onCancel={closeModal}
        isLoading={isCreating || isUpdating}
        disabled={isCreating || isUpdating}
        submitLabel={initValues ? 'Save changes' : 'Schedule notification'}
      />
    </form>
  );
}
