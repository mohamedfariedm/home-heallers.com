'use client';
import { HeaderCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from '@/components/ui/action-icon';
import { Tooltip } from '@/components/ui/tooltip';
import TrashIcon from '@/components/icons/trash';
import PencilIcon from '@/components/icons/pencil';
import CreateButton from '../create-button';
import DeletePopover from '@/app/shared/delete-popover';
import { Badge } from '@/components/ui/badge';
import CreateOrUpdateReservation from './reservations-form';

interface Columns {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string[]) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
}

export const getColumns = ({
  data,
  sortConfig,
  checkedItems,
  onDeleteItem,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
}: Columns) => [

  {
    title: (
      <div className="ps-2">
        <Checkbox
          title="Select All"
          onChange={handleSelectAll}
          checked={checkedItems.length === data.length}
          className="cursor-pointer"
        />
      </div>
    ),
    dataIndex: 'checked',
    key: 'checked',
    width: 20,
    render: (_: any, row: any) => (
      <Checkbox
        className="cursor-pointer"
        checked={checkedItems.includes(row.id)}
        {...(onChecked && { onChange: () => onChecked(row.id) })}
      />
    ),
  },
  {
    title: <></>,
    dataIndex: 'actions',
    key: 'actions',
    width: 20,
    render: (_: any, row: any) => (
      <div className="flex items-center gap-3">
        <Tooltip size="sm" content={() => 'Edit'} placement="top" color="invert">
          <CreateButton
            icon={
              <ActionIcon tag="span" size="sm" variant="outline">
                <PencilIcon className="h-4 w-4" />
              </ActionIcon>
            }
            view={<CreateOrUpdateReservation initValues={row} />}
            label=""
            className="p-0 m-0 bg-transparent text-gray-700"
          />
        </Tooltip>
        <DeletePopover
          title={`Delete Reservation`}
          description={`Are you sure you want to delete reservation #${row.id}?`}
          onDelete={() => onDeleteItem([row.id])}
        >
          <ActionIcon size="sm" variant="outline" className="hover:text-gray-700">
            <TrashIcon className="h-4 w-4" />
          </ActionIcon>
        </DeletePopover>
      </div>
    ),
  },
  // ✅ Reservation ID
  {
    title: <HeaderCell className='whitespace-nowrap' title="Reservation ID" />,
    dataIndex: 'id',
    key: 'id',
    width: 80,
    render: (id: number) => <span className="font-semibold text-gray-800">#{id}</span>,
  },

  // ✅ Patient
  {
    title: <HeaderCell title="Patient" />,
    dataIndex: 'patient',
    key: 'patient',
    render: (_: any, row: any) => (
      <div className="flex flex-col">
        <span className="font-medium">
          {row?.patient?.name?.en ?? row?.guest_info?.name ?? '—'}
        </span>
        <span className="text-xs text-gray-500">
          {row?.patient?.email ?? row?.guest_info?.email ?? ''}
        </span>
      </div>
    ),
  },

  // ✅ Doctor
  {
    title: <HeaderCell title="Doctor" />,
    dataIndex: 'doctor',
    key: 'doctor',
    render: (_: any, row: any) => row?.doctor?.name ?? '—',
  },

  // ✅ Service
  {
    title: <HeaderCell title="Service" />,
    dataIndex: 'service',
    key: 'service',
    render: (_: any, row: any) =>
      row?.service?.name?.en ?? row?.service?.name?.ar ?? '—',
  },

  // ✅ Status
  {
    title: <HeaderCell title="Status" align="center" />,
    dataIndex: 'status_label',
    key: 'status_label',
    align: 'center',
    render: (status_label: string) => (
      <Badge variant="outline">{status_label ?? '—'}</Badge>
    ),
  },

  // ✅ Paid
  {
    title: <HeaderCell title="Paid" />,
    dataIndex: 'paid',
    key: 'paid',
    render: (paid: number) => (paid ? 'Yes' : 'No'),
  },

  // ✅ Sessions Count
  {
    title: <HeaderCell title="Sessions" />,
    dataIndex: 'sessions_count',
    key: 'sessions_count',
    render: (sessions_count: number) => sessions_count ?? '—',
  },

  // ✅ Total Amount
  {
    title: <HeaderCell title="Total Amount" />,
    dataIndex: 'total_amount',
    key: 'total_amount',
    render: (total_amount: string) =>
      total_amount ? `${total_amount} SAR` : '—',
  },

  // ✅ Pain Location
  {
    title: <HeaderCell title="Pain Location" />,
    dataIndex: 'pain_location',
    key: 'pain_location',
    render: (pain_location: string) => pain_location ?? '—',
  },

  // ✅ Notes
  {
    title: <HeaderCell title="Notes" />,
    dataIndex: 'notes',
    key: 'notes',
    render: (notes: string) => notes ?? '—',
  },

  // ✅ Dates (Sessions)
  {
    title: <HeaderCell title="Dates" align="center" />,
    dataIndex: 'dates',
    key: 'dates',
    align: 'center',
    render: (_: any, row: any) => {
      const sessions = row.dates;
      if (!sessions || sessions.length === 0) return '—';

      return (
        <div className="flex flex-col gap-1 w-[200px]">
          {sessions.map((date: any, index: number) => {
            const start = date.start_time
              ? new Date(date.start_time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—';
            const end = date.end_time
              ? new Date(date.end_time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—';
            const day = date.date
              ? new Date(date.date).toLocaleDateString()
              : '—';

            return (
              <div
                key={`${index}-${date.id}`}
                className="text-sm text-gray-700"
              >
                <span className="font-medium">{day}</span> ({date.time_period})
                <br />
                {start} → {end}
              </div>
            );
          })}
        </div>
      );
    },
  },

  // ✅ Created At
  {
    title: <HeaderCell className='w-[100px]' title="Created At" />,
    dataIndex: 'created_at',
    key: 'created_at',
    render: (created_at: string) => created_at ?? '—',
  },
];
