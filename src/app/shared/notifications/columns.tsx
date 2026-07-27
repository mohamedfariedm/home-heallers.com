'use client';

import Link from 'next/link';
import { HeaderCell } from '@/components/ui/table';
import { ActionIcon } from '@/components/ui/action-icon';
import { Tooltip } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import DateCell from '@/components/ui/date-cell';
import EyeIcon from '@/components/icons/eye';
import PencilIcon from '@/components/icons/pencil';
import TrashIcon from '@/components/icons/trash';
import CreateButton from '@/app/shared/create-button';
import DeletePopover from '@/app/shared/delete-popover';
import ScheduledNotificationForm from '@/app/shared/notifications/scheduled-form';
import ScheduledNotificationDetailsModal from '@/app/shared/notifications/scheduled-detail-modal';
import {
  formatRecipientType,
  formatSentSource,
} from '@/app/shared/notifications/constants';
import type {
  ScheduledNotification,
  SentNotification,
} from '@/types/admin-notifications';
import { routes } from '@/config/routes';

function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return <Text className="text-gray-400">—</Text>;

  const color =
    status === 'sent' || status === 'pending'
      ? status === 'sent'
        ? 'success'
        : 'warning'
      : status === 'failed' || status === 'canceled'
        ? 'danger'
        : 'secondary';

  return (
    <Badge variant="flat" color={color as 'success' | 'warning' | 'danger' | 'secondary'} className="capitalize">
      {status}
    </Badge>
  );
}

type ScheduledColumnsProps = {
  onCancel: (id: number) => void;
};

export function getScheduledColumns({ onCancel }: ScheduledColumnsProps) {
  return [
    {
      title: <></>,
      dataIndex: 'action',
      key: 'action',
      width: 120,
      render: (_: string, row: ScheduledNotification) => (
        <div className="flex items-center gap-3">
          <Tooltip size="sm" content={() => 'View details'} placement="top" color="invert">
            <CreateButton
              icon={
                <ActionIcon tag="span" size="sm" variant="outline">
                  <EyeIcon className="h-4 w-4" />
                </ActionIcon>
              }
              view={<ScheduledNotificationDetailsModal notification={row} />}
              label=""
              className="m-0 bg-transparent p-0 text-gray-700"
              customSize="720px"
            />
          </Tooltip>

          {row.status === 'pending' ? (
            <>
              <Tooltip size="sm" content={() => 'Edit'} placement="top" color="invert">
                <CreateButton
                  icon={
                    <ActionIcon tag="span" size="sm" variant="outline">
                      <PencilIcon className="h-4 w-4" />
                    </ActionIcon>
                  }
                  view={<ScheduledNotificationForm initValues={row} />}
                  label=""
                  className="m-0 bg-transparent p-0 text-gray-700"
                  customSize="760px"
                />
              </Tooltip>

              <DeletePopover
                title="Cancel scheduled notification"
                description={`Are you sure you want to cancel "${row.title}"?`}
                onDelete={() => onCancel(row.id)}
              >
                <ActionIcon
                  size="sm"
                  variant="outline"
                  className="hover:border-red-500 hover:text-red-500"
                >
                  <TrashIcon className="h-4 w-4" />
                </ActionIcon>
              </DeletePopover>
            </>
          ) : null}
        </div>
      ),
    },
    {
      title: <HeaderCell title="Title" />,
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (value: string) => (
        <Text className="font-medium text-gray-900">{value}</Text>
      ),
    },
    {
      title: <HeaderCell title="Audience" />,
      dataIndex: 'recipient_type',
      key: 'recipient_type',
      width: 140,
      render: (value: string) => (
        <Text className="text-sm text-gray-700">{formatRecipientType(value)}</Text>
      ),
    },
    {
      title: <HeaderCell title="Status" />,
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (value: string) => <StatusBadge status={value} />,
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
      width: 90,
      render: (value: string) => (
        <Text className="uppercase text-gray-700">{value || '—'}</Text>
      ),
    },
    {
      title: <HeaderCell title="Created by" />,
      dataIndex: 'creator',
      key: 'creator',
      width: 140,
      render: (_: string, row: ScheduledNotification) => (
        <Text className="text-sm text-gray-700">{row.creator?.name ?? '—'}</Text>
      ),
    },
  ];
}

export function getSentColumns(localePrefix: string) {
  return [
    {
      title: <></>,
      dataIndex: 'action',
      key: 'action',
      width: 60,
      render: (_: string, row: SentNotification) => (
        <div className="flex items-center gap-3">
          <Tooltip size="sm" content={() => 'View details'} placement="top" color="invert">
            <Link
              href={`${localePrefix}${routes.notifications.sentDetail(row.id)}`}
              className="m-0 bg-transparent p-0 text-gray-700"
            >
              <ActionIcon tag="span" size="sm" variant="outline">
                <EyeIcon className="h-4 w-4" />
              </ActionIcon>
            </Link>
          </Tooltip>
        </div>
      ),
    },
    {
      title: <HeaderCell title="Title" />,
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (value: string) => (
        <Text className="font-medium text-gray-900">{value}</Text>
      ),
    },
    {
      title: <HeaderCell title="Source" />,
      dataIndex: 'source',
      key: 'source',
      width: 110,
      render: (value: string) => (
        <Badge variant="flat" className="capitalize">
          {formatSentSource(value)}
        </Badge>
      ),
    },
    {
      title: <HeaderCell title="Audience" />,
      dataIndex: 'recipient_type',
      key: 'recipient_type',
      width: 140,
      render: (value: string) => (
        <Text className="text-sm text-gray-700">{formatRecipientType(value)}</Text>
      ),
    },
    {
      title: <HeaderCell title="Status" />,
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      title: <HeaderCell title="Recipients" />,
      dataIndex: 'recipient_count',
      key: 'recipient_count',
      width: 100,
      render: (value: number | null) => (
        <Text className="text-sm text-gray-700">{value ?? '—'}</Text>
      ),
    },
    {
      title: <HeaderCell title="Delivered" />,
      dataIndex: 'delivered_count',
      key: 'delivered_count',
      width: 100,
      render: (value: number | null) => (
        <Text className="text-sm text-gray-700">{value ?? '—'}</Text>
      ),
    },
    {
      title: <HeaderCell title="Read / Unread" />,
      dataIndex: 'read_count',
      key: 'read_count',
      width: 120,
      render: (_: number | null, row: SentNotification) => (
        <Text className="text-sm text-gray-700">
          {row.read_count != null || row.unread_count != null
            ? `${row.read_count ?? 0} / ${row.unread_count ?? 0}`
            : '—'}
        </Text>
      ),
    },
    {
      title: <HeaderCell title="Queued" />,
      dataIndex: 'queued_count',
      key: 'queued_count',
      width: 90,
      render: (value: number | null) => (
        <Text className="text-sm text-gray-700">{value ?? '—'}</Text>
      ),
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
      width: 90,
      render: (value: string) => (
        <Text className="uppercase text-gray-700">{value || '—'}</Text>
      ),
    },
    {
      title: <HeaderCell title="Created by" />,
      dataIndex: 'creator',
      key: 'creator',
      width: 140,
      render: (_: string, row: SentNotification) => (
        <Text className="text-sm text-gray-700">
          {row.creator?.name ?? (row.source === 'system' ? 'System' : '—')}
        </Text>
      ),
    },
  ];
}
