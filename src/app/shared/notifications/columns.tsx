'use client';

import Link from 'next/link';
import { HeaderCell } from '@/components/ui/table';
import DateCell from '@/components/ui/date-cell';
import { Text } from '@/components/ui/text';
import { ScheduledRowActions } from '@/app/shared/notifications/scheduled-actions';
import {
  formatRecipientType,
  statusBadgeClass,
} from '@/app/shared/notifications/constants';
import type { ScheduledNotification } from '@/types/admin-notifications';

type ScheduledColumnsProps = {
  onCancel: (id: number) => void;
  isCanceling: boolean;
};

export function getScheduledColumns({
  onCancel,
  isCanceling,
}: ScheduledColumnsProps) {
  return [
    {
      title: <HeaderCell title="Title" />,
      dataIndex: 'title',
      key: 'title',
      width: 180,
      render: (_: string, row: ScheduledNotification) => (
        <Text className="font-medium text-gray-900">{row.title}</Text>
      ),
    },
    {
      title: <HeaderCell title="Audience" />,
      dataIndex: 'recipient_type',
      key: 'recipient_type',
      width: 140,
      render: (_: string, row: ScheduledNotification) =>
        formatRecipientType(row.recipient_type),
    },
    {
      title: <HeaderCell title="Status" />,
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (_: string, row: ScheduledNotification) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusBadgeClass(row.status)}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      title: <HeaderCell title="Scheduled at" />,
      dataIndex: 'scheduled_at',
      key: 'scheduled_at',
      width: 160,
      render: (value: string) => <DateCell date={new Date(value)} />,
    },
    {
      title: <HeaderCell title="Language" />,
      dataIndex: 'lang',
      key: 'lang',
      width: 80,
      render: (value: string) => value?.toUpperCase(),
    },
    {
      title: <HeaderCell title="Created by" />,
      dataIndex: 'creator',
      key: 'creator',
      width: 140,
      render: (_: string, row: ScheduledNotification) => row.creator?.name ?? '—',
    },
    {
      title: <HeaderCell title="Actions" />,
      dataIndex: 'action',
      key: 'action',
      width: 120,
      render: (_: string, row: ScheduledNotification) => (
        <ScheduledRowActions
          row={row}
          onCancel={onCancel}
          isCanceling={isCanceling}
        />
      ),
    },
  ];
}

export function getSentColumns(localePrefix: string) {
  return [
    {
      title: <HeaderCell title="Title" />,
      dataIndex: 'title',
      key: 'title',
      width: 180,
      render: (_: string, row: { id: number; title: string }) => (
        <Link
          href={`${localePrefix}/notifications/sent/${row.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.title}
        </Link>
      ),
    },
    {
      title: <HeaderCell title="Source" />,
      dataIndex: 'source',
      key: 'source',
      width: 110,
      render: (value: string) => value,
    },
    {
      title: <HeaderCell title="Audience" />,
      dataIndex: 'recipient_type',
      key: 'recipient_type',
      width: 140,
      render: (value: string) => formatRecipientType(value),
    },
    {
      title: <HeaderCell title="Status" />,
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (value: string) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusBadgeClass(value)}`}
        >
          {value}
        </span>
      ),
    },
    {
      title: <HeaderCell title="Queued jobs" />,
      dataIndex: 'queued_count',
      key: 'queued_count',
      width: 110,
      render: (value: number) => value ?? '—',
    },
    {
      title: <HeaderCell title="Sent at" />,
      dataIndex: 'sent_at',
      key: 'sent_at',
      width: 160,
      render: (value: string) => <DateCell date={new Date(value)} />,
    },
    {
      title: <HeaderCell title="Language" />,
      dataIndex: 'lang',
      key: 'lang',
      width: 80,
      render: (value: string) => value?.toUpperCase(),
    },
    {
      title: <HeaderCell title="Created by" />,
      dataIndex: 'creator',
      key: 'creator',
      width: 140,
      render: (_: string, row: { creator?: { name?: string } }) =>
        row.creator?.name ?? '—',
    },
  ];
}
