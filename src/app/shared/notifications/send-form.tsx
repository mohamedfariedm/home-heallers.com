'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Controller,
  type SubmitHandler,
  useForm,
  type FieldErrors,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PiUsers, PiArticle, PiXBold } from 'react-icons/pi';
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
import cn from '@/utils/class-names';

type SendTabId = 'audience' | 'content';

const SEND_TABS: {
  id: SendTabId;
  label: string;
  icon: typeof PiUsers;
}[] = [
  { id: 'audience', label: 'Audience', icon: PiUsers },
  { id: 'content', label: 'Content', icon: PiArticle },
];

function sendTabHasErrors(
  tabId: SendTabId,
  errors: FieldErrors<SendNotificationInput> | Record<string, unknown>
): boolean {
  const has = (keys: string[]) =>
    keys.some((key) => Boolean((errors as Record<string, unknown>)?.[key]));

  switch (tabId) {
    case 'audience':
      return has(['audience', 'recipients']);
    case 'content':
      return has([
        'title',
        'body',
        'lang',
        'type',
        'deep_link',
        'url',
        'extra_data_json',
      ]);
    default:
      return false;
  }
}

export default function SendNotificationForm() {
  const { closeModal } = useModal();
  const pathname = usePathname();
  const localePrefix = `/${pathname.split('/')[1] || 'en'}`;
  const { mutate: send, isPending } = useSendNotification();
  const [activeTab, setActiveTab] = useState(0);
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

  const onInvalid = (formErrors: FieldErrors<SendNotificationInput>) => {
    const tabIndex = SEND_TABS.findIndex((tab) =>
      sendTabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(SEND_TABS.length - 1, index)));
  };

  const tabsWithErrors: ModalFormTabItem[] = SEND_TABS.map((tab) => ({
    ...tab,
    hasError: sendTabHasErrors(tab.id, errors),
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
              Send notification now
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
              title="Audience"
              description="Who should receive this notification"
              contentClassName="sm:grid-cols-1"
            >
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
                      AUDIENCE_OPTIONS.find(
                        (option) => option.value === selected
                      )?.label ?? String(selected)
                    }
                    error={errors.audience?.message as string}
                  />
                )}
              />

              {audience === 'guests' && (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Guests are anonymous app installs. They receive push only — no
                  in-app inbox or read tracking.
                </p>
              )}

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
            </ModalFormTabPanelCard>
          </div>
        </ModalFormTabPanel>
      </ModalFormTabs>

      <ModalFormTabsFooter
        activeTab={activeTab}
        tabCount={SEND_TABS.length}
        onPrev={() => goToTab(activeTab - 1)}
        onNext={() => goToTab(activeTab + 1)}
        onCancel={closeModal}
        isLoading={isPending}
        disabled={isPending}
        submitLabel="Queue notification"
      />
    </form>
  );
}
