'use client';

import { HeaderCell } from '@/components/ui/table';
import { ActionIcon } from '@/components/ui/action-icon';
import { Tooltip } from '@/components/ui/tooltip';
import EyeIcon from '@/components/icons/eye';
import PencilIcon from '@/components/icons/pencil';
import Link from 'next/link';
import CreateButton from '../create-button';
import EditDoctorTargetForm from './edit-form';
import TargetStatusBadge, {
  doctorDisplayName,
  formatAchievement,
  formatMoney,
} from './status-badge';
import {
  getStatusActions,
  type DoctorTargetsPermissions,
} from './permissions';
import { routes } from '@/config/routes';

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
    title: <></>,
    dataIndex: 'actions',
    key: 'actions',
    width: 90,
    render: (_: any, row: any) => {
      const actions = getStatusActions(row.status, permissions);
      return (
        <div className="flex items-center gap-2">
          <Tooltip size="sm" content={() => 'View detail'} placement="top" color="invert">
            <Link
              href={routes.doctorTargets.detail(row.id)}
              className="p-0 m-0 bg-transparent text-gray-700"
            >
              <ActionIcon tag="span" size="sm" variant="outline">
                <EyeIcon className="h-4 w-4" />
              </ActionIcon>
            </Link>
          </Tooltip>
          {actions.edit && (
            <Tooltip size="sm" content={() => 'Edit'} placement="top" color="invert">
              <CreateButton
                icon={
                  <ActionIcon tag="span" size="sm" variant="outline">
                    <PencilIcon className="h-4 w-4" />
                  </ActionIcon>
                }
                view={<EditDoctorTargetForm initValues={row} />}
                label=""
                className="p-0 m-0 bg-transparent text-gray-700"
              />
            </Tooltip>
          )}
        </div>
      );
    },
  },
  {
    title: <HeaderCell title="ID" />,
    dataIndex: 'id',
    key: 'id',
    width: 70,
    render: (id: number) => (
      <span className="font-semibold text-gray-800">#{id}</span>
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
];
