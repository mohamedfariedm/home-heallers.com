'use client';

import Link from 'next/link';
import Cookies from 'js-cookie';
import { HeaderCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { ActionIcon } from '@/components/ui/action-icon';
import AvatarCard from '@/components/ui/avatar-card';
import EyeIcon from '@/components/icons/eye';
import DoctorActivityDrillDownLink from '@/app/shared/doctor-activity-reports/drill-down-link';
import {
  buildDoctorActivityDetailPath,
  formatReservationStatusLabel,
  formatSourceCampaignLabel,
  parseDoctorApiLinkToSearchParams,
} from '@/utils/doctor-activity-query';
import type { DoctorActivityRow } from '@/types/doctor-activity-report';

type ColumnsProps = {
  sortConfig?: { key: string | null; direction: string | null };
  onHeaderCellClick: (value: string) => { onClick: () => void };
};

function StatusCounts({ row }: { row: DoctorActivityRow }) {
  if (!row.by_status?.length) return <span className="text-gray-400">—</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {row.by_status.slice(0, 4).map((bucket, index) => {
        const label = formatReservationStatusLabel(bucket.status);
        const badge = (
          <Badge
            variant="flat"
            color="secondary"
            className={bucket.link ? 'cursor-pointer hover:opacity-80' : undefined}
          >
            {label.slice(0, 14)}
            {label.length > 14 ? '…' : ''} {bucket.count}
          </Badge>
        );

        return (
          <Tooltip
            key={`${String(bucket.status)}-${index}`}
            content={() => `${label}: ${bucket.count}`}
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

function SourceCampaignCounts({ row }: { row: DoctorActivityRow }) {
  if (!row.by_source_campaign?.length) {
    return <span className="text-gray-400">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {row.by_source_campaign.slice(0, 4).map((bucket) => {
        const label = formatSourceCampaignLabel(bucket.source_campaign);
        const badge = (
          <Badge
            variant="flat"
            color="secondary"
            className={bucket.link ? 'cursor-pointer hover:opacity-80' : undefined}
          >
            {label.slice(0, 12)}
            {label.length > 12 ? '…' : ''} {bucket.count}
          </Badge>
        );

        return (
          <Tooltip
            key={bucket.source_campaign}
            content={() => `${label}: ${bucket.count}`}
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
          <Link href={href} aria-label="View doctor reservations">
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
    width: 220,
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
    width: 120,
    render: (value: number) => (
      <span className="font-semibold text-gray-900 dark:text-gray-100">{value}</span>
    ),
  },
  {
    title: <HeaderCell title="By Status" />,
    dataIndex: 'by_status',
    key: 'by_status',
    width: 200,
    render: (_: unknown, row: DoctorActivityRow) => <StatusCounts row={row} />,
  },
  {
    title: <HeaderCell title="By Source Campaign" />,
    dataIndex: 'by_source_campaign',
    key: 'by_source_campaign',
    width: 200,
    render: (_: unknown, row: DoctorActivityRow) => (
      <SourceCampaignCounts row={row} />
    ),
  },
];
