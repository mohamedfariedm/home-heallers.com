'use client';

import { HeaderCell } from '@/components/ui/table';
import Link from 'next/link';
import { routes } from '@/config/routes';
import TargetStatusBadge, {
  doctorDisplayName,
  formatAchievement,
  formatMoney,
} from './status-badge';
import type { DoctorTargetsPermissions } from './permissions';
import DoctorTargetRowActions from './row-actions';

interface Columns {
  data: any[];
  permissions: DoctorTargetsPermissions;
  sortConfig?: any;
  onHeaderCellClick: (value: string) => void;
}

export const getColumns = ({
  permissions,
  onHeaderCellClick,
}: Columns) => [
  {
    title: <HeaderCell title="ID" />,
    dataIndex: 'id',
    key: 'id',
    width: 70,
    render: (id: number) => (
      <Link
        href={routes.doctorTargets.detail(id)}
        className="font-semibold text-gray-800 hover:underline"
      >
        #{id}
      </Link>
    ),
  },
  {
    title: <HeaderCell title="Doctor" />,
    dataIndex: 'doctor',
    key: 'doctor',
    width: 180,
    render: (_: any, row: any) => (
      <span>{doctorDisplayName(row.doctor, row.doctor_id)}</span>
    ),
  },
  {
    title: (
      <HeaderCell
        title="Dates"
        sortable
        ascending={false}
      />
    ),
    onHeaderCell: () => onHeaderCellClick('start_date'),
    dataIndex: 'start_date',
    key: 'start_date',
    width: 180,
    render: (_: any, row: any) => (
      <span className="text-sm">
        {row.start_date?.slice?.(0, 10) || '—'} → {row.end_date?.slice?.(0, 10) || '—'}
      </span>
    ),
  },
  {
    title: <HeaderCell title="Sessions" />,
    dataIndex: 'completed_sessions',
    key: 'completed_sessions',
    width: 120,
    render: (_: any, row: any) => (
      <span>
        {row.completed_sessions ?? 0} / {row.required_sessions ?? 0}
      </span>
    ),
  },
  {
    title: <HeaderCell title="Achievement" />,
    dataIndex: 'achievement_percentage',
    key: 'achievement_percentage',
    width: 110,
    render: (value: number) => formatAchievement(value),
  },
  {
    title: <HeaderCell title="Incentive" />,
    dataIndex: 'incentive_amount',
    key: 'incentive_amount',
    width: 110,
    render: (value: number) => formatMoney(value),
  },
  {
    title: <HeaderCell title="Status" />,
    dataIndex: 'status',
    key: 'status',
    width: 120,
    render: (status: string) => <TargetStatusBadge status={status} />,
  },
  {
    title: <HeaderCell title="Actions" align="center" />,
    dataIndex: 'actions',
    key: 'actions',
    width: 160,
    align: 'center' as const,
    onHeaderCell: () => ({
      className: '!text-center',
      style: { textAlign: 'center' },
    }),
    onCell: () => ({
      className: '!text-center',
      style: {
        whiteSpace: 'nowrap',
        overflow: 'visible',
        textAlign: 'center',
      },
    }),
    render: (_: any, row: any) => (
      <DoctorTargetRowActions row={row} permissions={permissions} />
    ),
  },
];
