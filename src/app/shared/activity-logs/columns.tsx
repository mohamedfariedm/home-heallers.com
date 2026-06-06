'use client';

import { HeaderCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { ActionIcon } from '@/components/ui/action-icon';
import DateCell from '@/components/ui/date-cell';
import AvatarCard from '@/components/ui/avatar-card';
import EyeIcon from '@/components/icons/eye';
import CreateButton from '@/app/shared/create-button';
import ActivityLogDetailsModal from '@/app/shared/activity-logs/details-modal';
import type { ActivityLog } from '@/types/activity-log';

type ColumnsProps = {
  data: ActivityLog[];
  sortConfig?: { key: string | null; direction: string | null };
  onHeaderCellClick: (value: string) => { onClick: () => void };
};

function EventBadge({ event }: { event: ActivityLog['event'] }) {
  if (!event) {
    return <span className="text-gray-400">—</span>;
  }

  const color =
    event === 'created' ? 'success' : event === 'updated' ? 'warning' : 'danger';

  return (
    <Badge variant="flat" color={color} className="capitalize">
      {event}
    </Badge>
  );
}

function truncateText(text: string, max = 60): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

export const getColumns = ({
  sortConfig,
  onHeaderCellClick,
}: ColumnsProps) => [
  {
    title: <></>,
    dataIndex: 'action',
    key: 'action',
    width: 48,
    render: (_: unknown, row: ActivityLog) => (
      <Tooltip size="sm" content={() => 'View details'} placement="top" color="invert">
        <CreateButton
          icon={
            <ActionIcon size="sm" variant="outline" aria-label="View activity log">
              <EyeIcon className="h-4 w-4" />
            </ActionIcon>
          }
          view={<ActivityLogDetailsModal id={row.id} />}
          label=""
          className="m-0 bg-transparent p-0 text-gray-700"
          customSize="720px"
        />
      </Tooltip>
    ),
  },
  {
    title: (
      <HeaderCell
        title="Date"
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'created_at'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('created_at'),
    dataIndex: 'created_at',
    key: 'created_at',
    width: 160,
    render: (value: string) => <DateCell date={new Date(value)} />,
  },
  {
    title: <HeaderCell title="User" />,
    dataIndex: 'causer',
    key: 'causer',
    width: 180,
    render: (_: unknown, row: ActivityLog) => (
      <div className="flex items-center gap-2">
        <AvatarCard
          src=""
          name={row.causer.name}
          description={row.causer.type ?? 'System'}
          avatarProps={{
            name: row.causer.name,
            className: '!bg-gray-200 !text-gray-700',
          }}
        />
      </div>
    ),
  },
  {
    title: (
      <HeaderCell
        title="Event"
        sortable
        ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'event'}
      />
    ),
    onHeaderCell: () => onHeaderCellClick('event'),
    dataIndex: 'event',
    key: 'event',
    width: 100,
    render: (value: ActivityLog['event']) => <EventBadge event={value} />,
  },
  {
    title: <HeaderCell title="Description" />,
    dataIndex: 'description',
    key: 'description',
    width: 240,
    render: (value: string) => (
      <Tooltip content={() => value} placement="top" color="invert">
        <span>{truncateText(value)}</span>
      </Tooltip>
    ),
  },
  {
    title: (
      <HeaderCell
        title="Log Name"
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'log_name'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('log_name'),
    dataIndex: 'log_name',
    key: 'log_name',
    width: 140,
    render: (value: string | null) => value ?? '—',
  },
];
