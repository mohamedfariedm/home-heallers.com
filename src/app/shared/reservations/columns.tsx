'use client';
import { HeaderCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from '@/components/ui/action-icon';
import { Tooltip } from '@/components/ui/tooltip';
import TrashIcon from '@/components/icons/trash';
import PencilIcon from '@/components/icons/pencil';
import ChatSolidIcon from '@/components/icons/chat-solid';
import CreateButton from '../create-button';
import DeletePopover from '@/app/shared/delete-popover';
import { Badge } from '@/components/ui/badge';
import CreateOrUpdateReservation from './reservations-form';
import ColumnFilterPopover from '@/app/shared/customer-suport/column-filter-popover';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import InviteDoctorsButton from './invite-doctors-button';

interface Columns {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string[]) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
  onFilterChange?: (key: string, value: any) => void;
}

export const getColumns = ({
  data,
  sortConfig,
  checkedItems,
  onDeleteItem,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
  onFilterChange,
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
    render: (_: any, row: any) => {
      const handleWhatsAppPayment = async () => {
        try {
          await client.reservations.createPaymentWhatsapp({
            reservation_id: row.id,
          });
          toast.success('Payment WhatsApp message sent successfully');
        } catch (error: any) {
          toast.error(
            error?.response?.data?.message ||
              'Failed to send payment WhatsApp message'
          );
        }
      };

      return (
        <div className="flex items-center gap-3">
          <Tooltip
            size="sm"
            content={() => 'Edit'}
            placement="top"
            color="invert"
          >
            <CreateButton
              icon={
                <ActionIcon tag="span" size="sm" variant="outline">
                  <PencilIcon className="h-4 w-4" />
                </ActionIcon>
              }
              view={<CreateOrUpdateReservation initValues={row} />}
              label=""
              className="m-0 bg-transparent p-0 text-gray-700"
            />
          </Tooltip>
          <Tooltip
            size="sm"
            content={() => 'Send Payment WhatsApp'}
            placement="top"
            color="invert"
          >
            <ActionIcon
              size="sm"
              variant="outline"
              className="cursor-pointer hover:text-gray-700"
              onClick={handleWhatsAppPayment}
            >
              <ChatSolidIcon className="h-4 w-4" />
            </ActionIcon>
          </Tooltip>
          <InviteDoctorsButton reservationId={row.id} />
          <DeletePopover
            title={`Delete Reservation`}
            description={`Are you sure you want to delete reservation #${row.id}?`}
            onDelete={() => onDeleteItem([row.id])}
          >
            <ActionIcon
              size="sm"
              variant="outline"
              className="hover:text-gray-700"
            >
              <TrashIcon className="h-4 w-4" />
            </ActionIcon>
          </DeletePopover>
        </div>
      );
    },
  },
  // ✅ Reservation ID
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell className="whitespace-nowrap" title="Reservation ID" />
        {onFilterChange && (
          <ColumnFilterPopover columnKey="id" onFilterChange={onFilterChange} />
        )}
      </div>
    ),
    dataIndex: 'id',
    key: 'id',
    width: 80,
    render: (id: number) => (
      <span className="font-semibold text-gray-800">#{id}</span>
    ),
  },

  // ✅ Patient
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="Patient" />
        {onFilterChange && (
          <ColumnFilterPopover
            columnKey="patient"
            onFilterChange={onFilterChange}
          />
        )}
      </div>
    ),
    dataIndex: 'patient',
    key: 'patient',
    render: (_: any, row: any) => {
      // Handle patient name - can be object with ar/en or just ar, or string
      let patientName = '—';
      if (row?.patient?.name) {
        if (typeof row.patient.name === 'string') {
          patientName = row.patient.name;
        } else {
          patientName = row.patient.name?.en ?? row.patient.name?.ar ?? '—';
        }
      } else if (row?.guest_info?.name) {
        patientName =
          typeof row.guest_info.name === 'string'
            ? row.guest_info.name
            : row.guest_info.name?.en ?? row.guest_info.name?.ar ?? '—';
      }

      // Handle patient email
      const patientEmail = row?.patient?.email ?? row?.guest_info?.email ?? '';

      return (
        <div className="flex flex-col">
          <span className="font-medium">{patientName}</span>
          {patientEmail && (
            <span className="text-xs text-gray-500">{patientEmail}</span>
          )}
        </div>
      );
    },
  },

  // ✅ Doctor
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="Doctor" />
        {onFilterChange && (
          <ColumnFilterPopover
            columnKey="doctor"
            onFilterChange={onFilterChange}
          />
        )}
      </div>
    ),
    dataIndex: 'doctor',
    key: 'doctor',
    render: (_: any, row: any) => {
      if (!row?.doctor) return '—';
      // Doctor name can be a string directly
      return typeof row.doctor.name === 'string'
        ? row.doctor.name
        : row.doctor.name?.en ?? row.doctor.name?.ar ?? '—';
    },
  },

  // ✅ Service
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="Service" />
        {onFilterChange && (
          <ColumnFilterPopover
            columnKey="service"
            onFilterChange={onFilterChange}
          />
        )}
      </div>
    ),
    dataIndex: 'service',
    key: 'service',
    render: (_: any, row: any) => {
      if (!row?.service) return '—';
      // Service name can be a string directly or an object with ar/en
      if (typeof row.service.name === 'string') {
        return row.service.name;
      }
      return row.service.name?.en ?? row.service.name?.ar ?? '—';
    },
  },

  // ✅ City
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="City" />
        {onFilterChange && (
          <ColumnFilterPopover
            columnKey="city"
            onFilterChange={onFilterChange}
          />
        )}
      </div>
    ),
    dataIndex: 'city',
    key: 'city',
    render: (_: any, row: any) => {
      // Try to get city from address first, then from patient
      let cityName = '—';
      
      // Check address.city
      if (row?.address?.city) {
        if (typeof row.address.city === 'string') {
          cityName = row.address.city;
        } else {
          cityName = row.address.city?.en ?? row.address.city?.ar ?? '—';
        }
      }
      
      // If no city from address, check patient.city
      if (cityName === '—' && row?.patient?.city?.name) {
        if (typeof row.patient.city.name === 'string') {
          cityName = row.patient.city.name;
        } else {
          cityName = row.patient.city.name?.en?.en ?? 
                     row.patient.city.name?.en ?? 
                     row.patient.city.name?.ar?.en ?? 
                     row.patient.city.name?.ar ?? '—';
        }
      }
      
      return cityName;
    },
  },

  // ✅ State
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="State" />
        {onFilterChange && (
          <ColumnFilterPopover
            columnKey="state"
            onFilterChange={onFilterChange}
          />
        )}
      </div>
    ),
    dataIndex: 'state',
    key: 'state',
    render: (_: any, row: any) => {
      // Try to get state from address first, then from patient
      let stateName = '—';
      
      // Check address.state
      if (row?.address?.state) {
        if (typeof row.address.state === 'string') {
          stateName = row.address.state;
        } else {
          stateName = row.address.state?.en ?? row.address.state?.ar ?? '—';
        }
      }
      
      // If no state from address, check patient.state
      if (stateName === '—' && row?.patient?.state) {
        if (typeof row.patient.state === 'string') {
          stateName = row.patient.state;
        } else {
          stateName = row.patient.state?.en ?? row.patient.state?.ar ?? '—';
        }
      }
      
      return stateName;
    },
  },

  // ✅ Status
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="Status" align="center" />
        {onFilterChange && (
          <ColumnFilterPopover
            columnKey="status_label"
            onFilterChange={onFilterChange}
          />
        )}
      </div>
    ),
    dataIndex: 'status_label',
    key: 'status_label',
    align: 'center',
    render: (status_label: string) => (
      <Badge variant="outline">{status_label ?? '—'}</Badge>
    ),
  },

  // ✅ Paid
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="Paid" />
        {onFilterChange && (
          <ColumnFilterPopover
            columnKey="paid"
            onFilterChange={onFilterChange}
          />
        )}
      </div>
    ),
    dataIndex: 'paid',
    key: 'paid',
    render: (paid: number | null | undefined) => {
      if (paid === null || paid === undefined) return '—';
      return paid ? 'Yes' : 'No';
    },
  },


  // ✅ Pain Location
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="Source Campaign" />
        {onFilterChange && (
          <ColumnFilterPopover
            columnKey="source_campaign"
            onFilterChange={onFilterChange}
          />
        )}
      </div>
    ),
    dataIndex: 'source_campaign',
    key: 'source_campaign',
    render: (source_campaign: string | null | undefined) => source_campaign ?? '—',
  },

  // ✅ Sessions Count
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="Sessions" />
        {onFilterChange && (
          <ColumnFilterPopover
            columnKey="sessions_count"
            onFilterChange={onFilterChange}
          />
        )}
      </div>
    ),
    dataIndex: 'sessions_count',
    key: 'sessions_count',
    render: (sessions_count: number | null | undefined) => {
      if (sessions_count === null || sessions_count === undefined) return '—';
      return sessions_count;
    },
  },

  // ✅ Total Amount
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="Total Amount" />
        {onFilterChange && (
          <ColumnFilterPopover
            columnKey="total_amount"
            onFilterChange={onFilterChange}
          />
        )}
      </div>
    ),
    dataIndex: 'total_amount',
    key: 'total_amount',
    render: (total_amount: string | null | undefined) => {
      if (!total_amount || total_amount === '0.00') return '—';
      return `${total_amount} SAR`;
    },
  },

  // ✅ Pain Location
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="Pain Location" />
        {onFilterChange && (
          <ColumnFilterPopover
            columnKey="pain_location"
            onFilterChange={onFilterChange}
          />
        )}
      </div>
    ),
    dataIndex: 'pain_location',
    key: 'pain_location',
    render: (pain_location: string | null | undefined) => pain_location ?? '—',
  },

  // ✅ Notes
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="Notes" />
        {onFilterChange && (
          <ColumnFilterPopover
            columnKey="notes"
            onFilterChange={onFilterChange}
          />
        )}
      </div>
    ),
    dataIndex: 'notes',
    key: 'notes',
    render: (notes: string | null | undefined) => notes ?? '—',
  },

  // ✅ Dates (Sessions)
  {
    title: (
      <div className="flex items-center justify-center gap-1">
        <HeaderCell title="Dates" align="center" />
        {onFilterChange && (
          <ColumnFilterPopover
            columnKey="dates"
            onFilterChange={onFilterChange}
          />
        )}
      </div>
    ),
    dataIndex: 'dates',
    key: 'dates',
    align: 'center',
    render: (_: any, row: any) => {
      const sessions = row?.dates;
      if (!sessions || !Array.isArray(sessions) || sessions.length === 0)
        return '—';

      return (
        <div className="flex w-[200px] flex-col gap-1">
          {sessions.map((date: any, index: number) => {
            let start = '—';
            let end = '—';
            let day = '—';

            try {
              if (date?.start_time) {
                start = new Date(date.start_time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
              }
              if (date?.end_time) {
                end = new Date(date.end_time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
              }
              if (date?.date) {
                day = new Date(date.date).toLocaleDateString();
              }
            } catch (error) {
              // Handle invalid date strings
              console.warn('Invalid date format:', date);
            }

            const timePeriod = date?.time_period ?? '—';

            return (
              <div
                key={`${index}-${date?.id ?? index}`}
                className="text-sm text-gray-700"
              >
                <span className="font-medium">{day}</span> ({timePeriod})
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
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell className="w-[100px]" title="Created At" />
        {onFilterChange && (
          <ColumnFilterPopover
            columnKey="created_at"
            onFilterChange={onFilterChange}
          />
        )}
      </div>
    ),
    dataIndex: 'created_at',
    key: 'created_at',
    render: (created_at: string | null | undefined) => created_at ?? '—',
  },
];
