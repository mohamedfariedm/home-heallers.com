'use client';

import { Tooltip } from '@/components/ui/tooltip';
import { HeaderCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from '@/components/ui/action-icon';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PiToggleLeft, PiToggleRight } from 'react-icons/pi';

type Columns = {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onToggleStatus: (id: number) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
};

export const getColumns = ({
  data,
  sortConfig,
  checkedItems,
  onToggleStatus,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
}: Columns) => [
  {
    title: (
      <div className="ps-2">
        <Checkbox
          title={'Select All'}
          onChange={handleSelectAll}
          checked={checkedItems.length === data.length && data.length > 0}
          className="cursor-pointer"
        />
      </div>
    ),
    dataIndex: 'checked',
    key: 'checked',
    width: 20,
    render: (_: any, row: any) => (
      <div className="inline-flex">
        <Checkbox
          className="cursor-pointer"
          checked={checkedItems.includes(String(row.id))}
          {...(onChecked && { onChange: () => onChecked(String(row.id)) })}
        />
      </div>
    ),
  },
  {
    title: <></>,
    dataIndex: 'action',
    key: 'action',
    width: 20,
    render: (_: string, row: any) => (
      <div className="flex items-center gap-3">
        <Tooltip
          size="sm"
          content={() => (row.status ? 'Deactivate Review' : 'Activate Review')}
          placement="top"
          color="invert"
        >
          <Button
            variant="text"
            size="sm"
            onClick={() => onToggleStatus(row.id)}
            className="hover:!text-gray-900"
          >
            {row.status ? (
              <PiToggleRight className="h-6 w-6 text-green-600" />
            ) : (
              <PiToggleLeft className="h-6 w-6 text-gray-400" />
            )}
          </Button>
        </Tooltip>
      </div>
    ),
  },
  {
    title: <HeaderCell align="center" title="ID" />,
    dataIndex: 'id',
    key: 'id',
    width: 80,
    render: (id: number) => (
      <div className="flex w-full justify-center text-center">
        <span className="font-medium">#{id}</span>
      </div>
    ),
  },
  {
    title: <HeaderCell align="center" title="Client" />,
    dataIndex: 'client',
    key: 'client',
    width: 150,
    render: (_: string, row: any) => (
      <div className="flex w-full justify-center text-center">
        {row.client ? (
          <AvatarCard
            src={''}
            name={row.client.name || 'N/A'}
            description={`ID: ${row.client_id}`}
          />
        ) : (
          <span className="text-gray-400">N/A</span>
        )}
      </div>
    ),
  },
  {
    title: <HeaderCell align="center" title="Doctor" />,
    dataIndex: 'doctor',
    key: 'doctor',
    width: 150,
    render: (_: string, row: any) => (
      <div className="flex w-full justify-center text-center">
        {row.doctor ? (
          <AvatarCard
            src={''}
            name={row.doctor.name || 'N/A'}
            description={`ID: ${row.doctor_id}`}
          />
        ) : (
          <span className="text-gray-400">N/A</span>
        )}
      </div>
    ),
  },
  {
    title: <HeaderCell align="center" title="Reservation ID" />,
    dataIndex: 'reservation_id',
    key: 'reservation_id',
    width: 120,
    render: (id: number, row: any) => (
      <div className="flex w-full justify-center text-center">
        <span className="font-medium">#{id}</span>
        {row.reservation && (
          <span className="ml-2 text-xs text-gray-500">
            (Status: {row.reservation.status})
          </span>
        )}
      </div>
    ),
  },
  {
    title: <HeaderCell align="center" title="Doctor Rating" />,
    dataIndex: 'doctor_rate',
    key: 'doctor_rate',
    width: 120,
    render: (rate: number | null) => (
      <div className="flex w-full justify-center text-center">
        {rate ? (
          <Badge color="success" variant="flat">
            {rate}/5 ⭐
          </Badge>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </div>
    ),
  },
  {
    title: <HeaderCell align="center" title="Doctor Comment" />,
    dataIndex: 'doctor_comment',
    key: 'doctor_comment',
    width: 200,
    render: (comment: string | null) => (
      <Tooltip
        showArrow
        className=""
        content={() => (
          <div className="max-w-[400px]">{comment || 'No comment'}</div>
        )}
      >
        <div className="mx-auto line-clamp-2 max-w-[400px] text-center">
          {comment || <span className="text-gray-400">-</span>}
        </div>
      </Tooltip>
    ),
  },
  {
    title: <HeaderCell align="center" title="Reservation Rating" />,
    dataIndex: 'reservation_rate',
    key: 'reservation_rate',
    width: 120,
    render: (rate: number | null) => (
      <div className="flex w-full justify-center text-center">
        {rate ? (
          <Badge color="success" variant="flat">
            {rate}/5 ⭐
          </Badge>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </div>
    ),
  },
  {
    title: <HeaderCell align="center" title="Reservation Comment" />,
    dataIndex: 'reservation_comment',
    key: 'reservation_comment',
    width: 200,
    render: (comment: string | null) => (
      <Tooltip
        showArrow
        className=""
        content={() => (
          <div className="max-w-[400px]">{comment || 'No comment'}</div>
        )}
      >
        <div className="mx-auto line-clamp-2 max-w-[400px] text-center">
          {comment || <span className="text-gray-400">-</span>}
        </div>
      </Tooltip>
    ),
  },
  {
    title: <HeaderCell align="center" title="Status" />,
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (status: boolean) => (
      <div className="flex w-full justify-center text-center">
        <Badge
          color={status ? 'success' : 'danger'}
          variant="flat"
          renderAsDot
        >
          {status ? 'Active' : 'Inactive'}
        </Badge>
      </div>
    ),
  },
  {
    title: (
      <HeaderCell
        align="center"
        title={'Created'}
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'created_at'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('created_at'),
    dataIndex: 'created_at',
    key: 'created_at',
    width: 100,
    render: (value: Date) => <DateCell date={value} />,
  },
  {
    title: (
      <HeaderCell
        align="center"
        title={'Updated'}
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'updated_at'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('updated_at'),
    dataIndex: 'updated_at',
    key: 'updated_at',
    width: 100,
    render: (value: Date) => <DateCell date={value} />,
  },
];
