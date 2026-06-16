'use client';

import Link from 'next/link';
import Cookies from 'js-cookie';
import cn from '@/utils/class-names';
import { HeaderCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { ActionIcon } from '@/components/ui/action-icon';
import DateCell from '@/components/ui/date-cell';
import AvatarCard from '@/components/ui/avatar-card';
import EyeIcon from '@/components/icons/eye';
import DoctorActivityDrillDownLink from '@/app/shared/doctor-activity-reports/drill-down-link';
import {
  buildDoctorActivityDetailPath,
  parseDoctorApiLinkToSearchParams,
} from '@/utils/doctor-activity-query';
import type { DoctorActivityRow } from '@/types/doctor-activity-report';

type ColumnsProps = {
  sortConfig?: { key: string | null; direction: string | null };
  onHeaderCellClick: (value: string) => { onClick: () => void };
};

function LogNameCounts({ row }: { row: DoctorActivityRow }) {
  if (!row.by_log_name?.length) return <span className="text-gray-400">—</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {row.by_log_name.slice(0, 4).map((bucket) => {
        const badge = (
          <Badge
            variant="flat"
            color="secondary"
            className={bucket.link ? 'cursor-pointer hover:opacity-80' : undefined}
          >
            {bucket.log_name.slice(0, 12)}
            {bucket.log_name.length > 12 ? '…' : ''} {bucket.count}
          </Badge>
        );

        return (
          <Tooltip
            key={bucket.log_name}
            content={() => `${bucket.log_name}: ${bucket.count}`}
            placement="top"
            color="invert"
          >
            {bucket.link ? (
              <DoctorActivityDrillDownLink link={bucket.link} doctorId={row.doctor.id}>
                {badge}
              </DoctorActivityDrillDownLink>
            ) : (
              badge
            )}
          </Tooltip>
        );
      })}
    </div>
  );
}

function EventCounts({ row }: { row: DoctorActivityRow }) {
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

        const badge = (
          <Badge
            variant="flat"
            color={color}
            className={cn(
              'capitalize',
              bucket.link && 'cursor-pointer hover:opacity-80'
            )}
          >
            {bucket.event?.slice(0, 1) ?? '?'} {bucket.count}
          </Badge>
        );

        return (
          <Tooltip
            key={bucket.event ?? 'none'}
            content={() => `${bucket.event ?? 'other'}: ${bucket.count}`}
            placement="top"
            color="invert"
          >
            {bucket.link ? (
              <DoctorActivityDrillDownLink link={bucket.link} doctorId={row.doctor.id}>
                {badge}
              </DoctorActivityDrillDownLink>
            ) : (
              badge
            )}
          </Tooltip>
        );
      })}
    </div>
  );
}

function TopModels({ row }: { row: DoctorActivityRow }) {
  const models = row.most_modified_models?.slice(0, 2) ?? [];
  if (!models.length) return <span className="text-gray-400">—</span>;

  return (
    <span className="text-sm text-gray-700 dark:text-gray-300">
      {models.map((m) => `${m.type} (${m.count})`).join(', ')}
    </span>
  );
}

export const getDoctorActivityColumns = ({
  sortConfig,
  onHeaderCellClick,
}: ColumnsProps) => [
  {
    title: <></>,
    dataIndex: 'action',
    key: 'action',
    width: 48,
    render: (_: unknown, row: DoctorActivityRow) => {
      const locale = Cookies.get('NEXT_LOCALE') || 'en';
      const params = parseDoctorApiLinkToSearchParams(row.link);
      params.delete('tab');
      const href = buildDoctorActivityDetailPath(locale, row.doctor.id, params);

      return (
        <Tooltip size="sm" content={() => 'View reservations'} placement="top" color="invert">
          <Link href={href} aria-label="View doctor activity">
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
        title="Doctor"
        sortable
        ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'name'}
      />
    ),
    onHeaderCell: () => onHeaderCellClick('name'),
    dataIndex: 'doctor',
    key: 'doctor',
    width: 200,
    render: (_: unknown, row: DoctorActivityRow) => (
      <AvatarCard
        src=""
        name={row.doctor.name}
        description={row.doctor.specialist ?? row.doctor.email ?? undefined}
        avatarProps={{
          name: row.doctor.name,
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
    width: 110,
    render: (value: number) => (
      <span className="font-semibold text-gray-900 dark:text-gray-100">{value}</span>
    ),
  },
  {
    title: (
      <HeaderCell
        title="Reservations"
        sortable
        ascending={
          sortConfig?.direction === 'asc' &&
          sortConfig?.key === 'reservations_count'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('reservations_count'),
    dataIndex: 'reservations_count',
    key: 'reservations_count',
    width: 110,
    render: (value: number) => value,
  },
  {
    title: <HeaderCell title="By Event" />,
    dataIndex: 'by_event',
    key: 'by_event',
    width: 180,
    render: (_: unknown, row: DoctorActivityRow) => <EventCounts row={row} />,
  },
  {
    title: <HeaderCell title="By Log Name" />,
    dataIndex: 'by_log_name',
    key: 'by_log_name',
    width: 180,
    render: (_: unknown, row: DoctorActivityRow) => <LogNameCounts row={row} />,
  },
  {
    title: <HeaderCell title="Top Models" />,
    dataIndex: 'most_modified_models',
    key: 'most_modified_models',
    width: 160,
    render: (_: unknown, row: DoctorActivityRow) => <TopModels row={row} />,
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
];
