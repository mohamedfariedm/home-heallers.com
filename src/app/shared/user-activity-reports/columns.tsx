'use client';

import Link from 'next/link';
import Cookies from 'js-cookie';
import { HeaderCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { ActionIcon } from '@/components/ui/action-icon';
import DateCell from '@/components/ui/date-cell';
import AvatarCard from '@/components/ui/avatar-card';
import EyeIcon from '@/components/icons/eye';
import {
  buildUserActivityDetailPath,
  formatUserActivityLogName,
  parseUserApiLinkToSearchParams,
} from '@/utils/user-activity-query';
import type { UserActivityRow } from '@/types/user-activity-report';

type ColumnsProps = {
  sortConfig?: { key: string | null; direction: string | null };
  onHeaderCellClick: (value: string) => { onClick: () => void };
};

function logNameBadgeColor(logName: string) {
  if (logName === 'inbound') return 'success';
  if (logName === 'outbound') return 'warning';
  return 'secondary';
}

function LogNameCounts({ row }: { row: UserActivityRow }) {
  if (!row.by_log_name?.length) return <span className="text-gray-400">—</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {row.by_log_name.slice(0, 4).map((bucket) => {
        const label = formatUserActivityLogName(bucket.log_name);
        return (
          <Tooltip
            key={bucket.log_name}
            content={() => `${label}: ${bucket.count}`}
            placement="top"
            color="invert"
          >
            <Badge variant="flat" color={logNameBadgeColor(bucket.log_name)}>
              {label.slice(0, 12)}
              {label.length > 12 ? '…' : ''} {bucket.count}
            </Badge>
          </Tooltip>
        );
      })}
    </div>
  );
}

function EventCounts({ row }: { row: UserActivityRow }) {
  if (!row.by_event?.length) return <span className="text-gray-400">—</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {row.by_event.map((bucket) => {
        const color =
          bucket.event === 'created'
            ? 'success'
            : bucket.event === 'updated'
              ? 'warning'
              : bucket.event === 'deleted'
                ? 'danger'
                : 'secondary';

        return (
          <Tooltip
            key={bucket.event ?? 'none'}
            content={() => `${bucket.event ?? 'other'}: ${bucket.count}`}
            placement="top"
            color="invert"
          >
            <Badge variant="flat" color={color} className="capitalize">
              {bucket.event?.slice(0, 1) ?? '?'} {bucket.count}
            </Badge>
          </Tooltip>
        );
      })}
    </div>
  );
}

function TopModels({ row }: { row: UserActivityRow }) {
  const models = row.most_modified_models?.slice(0, 2) ?? [];
  if (!models.length) return <span className="text-gray-400">—</span>;

  return (
    <span className="text-sm text-gray-700 dark:text-gray-300">
      {models.map((m) => `${m.type} (${m.count})`).join(', ')}
    </span>
  );
}

export const getUserActivityColumns = ({
  sortConfig,
  onHeaderCellClick,
}: ColumnsProps) => [
  {
    title: <></>,
    dataIndex: 'action',
    key: 'action',
    width: 48,
    render: (_: unknown, row: UserActivityRow) => {
      const locale = Cookies.get('NEXT_LOCALE') || 'en';
      const params = parseUserApiLinkToSearchParams(row.link);
      params.delete('tab');
      const href = buildUserActivityDetailPath(locale, row.user.id, params);

      return (
        <Tooltip size="sm" content={() => 'View records'} placement="top" color="invert">
          <Link href={href} aria-label="View user activity">
            <ActionIcon size="sm" variant="outline">
              <EyeIcon className="h-4 w-4" />
            </ActionIcon>
          </Link>
        </Tooltip>
      );
    },
  },
  {
    title: (
      <HeaderCell
        title="User"
        sortable
        ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'name'}
      />
    ),
    onHeaderCell: () => onHeaderCellClick('name'),
    dataIndex: 'user',
    key: 'user',
    width: 200,
    render: (_: unknown, row: UserActivityRow) => (
      <AvatarCard
        src=""
        name={row.user.name}
        description={row.user.email ?? row.user.roles.join(', ')}
        avatarProps={{
          name: row.user.name,
          className: '!bg-gray-200 !text-gray-700',
        }}
      />
    ),
  },
  {
    title: (
      <HeaderCell
        title="Total Actions"
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'total_actions'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('total_actions'),
    dataIndex: 'total_actions',
    key: 'total_actions',
    width: 120,
    render: (value: number) => (
      <span className="font-semibold text-gray-900 dark:text-gray-100">{value}</span>
    ),
  },
  {
    title: <HeaderCell title="By Event" />,
    dataIndex: 'by_event',
    key: 'by_event',
    width: 180,
    render: (_: unknown, row: UserActivityRow) => <EventCounts row={row} />,
  },
  {
    title: <HeaderCell title="By Log Name" />,
    dataIndex: 'by_log_name',
    key: 'by_log_name',
    width: 180,
    render: (_: unknown, row: UserActivityRow) => <LogNameCounts row={row} />,
  },
  {
    title: <HeaderCell title="Top Models" />,
    dataIndex: 'most_modified_models',
    key: 'most_modified_models',
    width: 180,
    render: (_: unknown, row: UserActivityRow) => <TopModels row={row} />,
  },
  {
    title: (
      <HeaderCell
        title="First Activity"
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'first_activity_at'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('first_activity_at'),
    dataIndex: 'first_activity_at',
    key: 'first_activity_at',
    width: 160,
    render: (value: string | null) =>
      value ? <DateCell date={new Date(value)} /> : <span className="text-gray-400">—</span>,
  },
  {
    title: (
      <HeaderCell
        title="Last Activity"
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'last_activity_at'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('last_activity_at'),
    dataIndex: 'last_activity_at',
    key: 'last_activity_at',
    width: 160,
    render: (value: string | null) =>
      value ? <DateCell date={new Date(value)} /> : <span className="text-gray-400">—</span>,
  },
  {
    title: <HeaderCell title="Active Days" />,
    dataIndex: 'active_days',
    key: 'active_days',
    width: 100,
    render: (value: number) => value,
  },
  {
    title: <HeaderCell title="Today" />,
    dataIndex: 'today',
    key: 'today',
    width: 80,
    render: (value: number) => value,
  },
  {
    title: <HeaderCell title="This Week" />,
    dataIndex: 'this_week',
    key: 'this_week',
    width: 90,
    render: (value: number) => value,
  },
  {
    title: <HeaderCell title="This Month" />,
    dataIndex: 'this_month',
    key: 'this_month',
    width: 100,
    render: (value: number) => value,
  },
];

export function UserNameLink({ row }: { row: UserActivityRow }) {
  const locale = Cookies.get('NEXT_LOCALE') || 'en';
  const params = parseUserApiLinkToSearchParams(row.link);
  params.delete('tab');
  const href = buildUserActivityDetailPath(locale, row.user.id, params);

  return (
    <Link href={href} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
      {row.user.name}
    </Link>
  );
}
