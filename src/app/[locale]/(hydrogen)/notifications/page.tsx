'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import SendNotificationForm from '@/app/shared/notifications/send-form';
import ScheduledNotificationForm from '@/app/shared/notifications/scheduled-form';
import ScheduledNotificationsTable from '@/app/shared/notifications/scheduled-table';
import SentNotificationsTable from '@/app/shared/notifications/sent-table';
import CreateButton from '@/app/shared/create-button';
import {
  useScheduledNotifications,
  useSentNotifications,
} from '@/framework/notifications';
import cn from '@/utils/class-names';
import type {
  ScheduledNotification,
  SentNotification,
} from '@/types/admin-notifications';

type NotificationTab = 'send' | 'scheduled' | 'sent';

const pageHeader = {
  title: 'Push Notifications',
  breadcrumb: [
    { href: '/', name: 'Home' },
    { name: 'Push Notifications' },
  ],
};

function buildQuery(searchParams: URLSearchParams, tab: NotificationTab) {
  const params = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== 'tab') params.set(key, value);
  });
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('per_page')) params.set('per_page', '20');
  params.delete('limit');
  return params;
}

export default function NotificationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab: NotificationTab =
    searchParams.get('tab') === 'scheduled'
      ? 'scheduled'
      : searchParams.get('tab') === 'sent'
        ? 'sent'
        : 'send';

  const scheduledQuery = useMemo(() => {
    const params = buildQuery(new URLSearchParams(searchParams.toString()), 'scheduled');
    return params.toString();
  }, [searchParams]);

  const sentQuery = useMemo(() => {
    const params = buildQuery(new URLSearchParams(searchParams.toString()), 'sent');
    return params.toString();
  }, [searchParams]);

  const {
    data: scheduledData,
    isLoading: scheduledLoading,
    isError: scheduledError,
    error: scheduledErrorObj,
  } = useScheduledNotifications(scheduledQuery, activeTab === 'scheduled');

  const {
    data: sentData,
    isLoading: sentLoading,
    isError: sentError,
    error: sentErrorObj,
  } = useSentNotifications(sentQuery, activeTab === 'sent');

  const setTab = (tab: NotificationTab) => {
    const next = new URLSearchParams(searchParams.toString());
    if (tab === 'send') next.delete('tab');
    else next.set('tab', tab);
    next.set('page', '1');
    router.push(`${pathname}?${next.toString()}`);
  };

  const scheduledRows: ScheduledNotification[] =
    scheduledData?.data?.notifications ?? [];
  const scheduledTotal = scheduledData?.data?.pagination?.total ?? 0;

  const sentRows: SentNotification[] = sentData?.data?.notifications ?? [];
  const sentTotal = sentData?.data?.pagination?.total ?? 0;

  const createElement =
    activeTab === 'send' ? (
      <SendNotificationForm />
    ) : activeTab === 'scheduled' ? (
      <ScheduledNotificationForm />
    ) : undefined;

  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={{ columns: [], rows: [] }}
      fileName="notifications/sent"
      header="Title,Source,Audience,Status,Sent At"
      createName={
        activeTab === 'send'
          ? 'Send now'
          : activeTab === 'scheduled'
            ? 'Schedule'
            : undefined
      }
      createElementButton={createElement}
      customSize="760px"
      canExport={false}
      canImport={false}
      canCreate={activeTab !== 'sent'}
    >
      <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {(
          [
            { id: 'send', label: 'Send now' },
            { id: 'scheduled', label: 'Scheduled' },
            { id: 'sent', label: 'Sent history' },
          ] as const
        ).map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'solid' : 'outline'}
            onClick={() => setTab(tab.id)}
            className={cn(
              activeTab === tab.id &&
                'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
            )}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === 'send' && (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-900/40">
          <Text className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Queue an immediate push notification and in-app inbox entry.
          </Text>
          <Text className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Success means jobs were queued — not that every device received the push.
          </Text>
          <div className="mt-5 flex justify-center">
            <CreateButton
              label="Send notification"
              view={<SendNotificationForm />}
              customSize="760px"
            />
          </div>
        </div>
      )}

      {activeTab === 'scheduled' &&
        (scheduledLoading ? (
          <div className="m-auto py-16">
            <Spinner size="lg" />
          </div>
        ) : scheduledError ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {scheduledErrorObj?.message ?? 'Failed to load scheduled notifications.'}
          </div>
        ) : (
          <>
            {scheduledTotal === 0 && (
              <div className="mb-4 rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-center">
                <Text className="text-sm text-gray-600">
                  No scheduled notifications yet.
                </Text>
              </div>
            )}
            <ScheduledNotificationsTable
              data={scheduledRows}
              totalItems={scheduledTotal}
            />
          </>
        ))}

      {activeTab === 'sent' &&
        (sentLoading ? (
          <div className="m-auto py-16">
            <Spinner size="lg" />
          </div>
        ) : sentError ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {sentErrorObj?.message ?? 'Failed to load sent notifications.'}
          </div>
        ) : (
          <>
            {sentTotal === 0 && (
              <div className="mb-4 rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-center">
                <Text className="text-sm text-gray-600">
                  No sent notifications match your filters yet.
                </Text>
              </div>
            )}
            <SentNotificationsTable data={sentRows} totalItems={sentTotal} />
          </>
        ))}
    </TableLayout>
  );
}
