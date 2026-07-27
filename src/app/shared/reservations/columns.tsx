'use client';
import { HeaderCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from '@/components/ui/action-icon';
import { Tooltip } from '@/components/ui/tooltip';
import TrashIcon from '@/components/icons/trash';
import PencilIcon from '@/components/icons/pencil';
import EyeIcon from '@/components/icons/eye';
import ChatSolidIcon from '@/components/icons/chat-solid';
import CreateButton from '../create-button';
import DeletePopover from '@/app/shared/delete-popover';
import { Badge } from '@/components/ui/badge';
import cn from '@/utils/class-names';
import CreateOrUpdateReservation from './reservations-form';
import ReservationViewModal from './reservation-view-modal';
import ColumnFilterPopover from '@/app/shared/customer-suport/column-filter-popover';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import InviteDoctorsButton from './invite-doctors-button';
import { PiDeviceMobile, PiGlobe, PiReceipt } from 'react-icons/pi';
import {
  getReservationPatientName,
  resolveLocalizedName,
  resolveLocalizedNameOrFallback,
} from '@/utils/resolve-localized-name';
import {
  getPaymentStatusBadgeClasses,
  getPaymentStatusBadgeLabel,
  getPaymentStatusColorClass,
  getPaymentStatusLabel,
  getPaymentWhatsappDisabledReason,
  shouldHidePaymentLink,
} from '@/utils/reservation-payment';
import {
  canSendInvoiceWhatsapp as canSendInvoiceWhatsappForRow,
  getReservationClientMobile,
  getSendInvoiceWhatsappDisabledReason,
} from '@/utils/reservation-invoice-whatsapp';

const truncateText = (value: string, max = 80) => {
  if (value.length <= max) return value;
  return `${value.slice(0, max).trimEnd()}...`;
};

const formatSessionLabel = (session: any) => {
  let start = '—';
  let end = '—';
  let day = '—';

  try {
    if (session?.start_time) {
      start = new Date(session.start_time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (session?.end_time) {
      end = new Date(session.end_time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (session?.date) {
      day = new Date(session.date).toLocaleDateString();
    }
  } catch (error) {
    console.warn('Invalid date format:', session);
  }

  const timePeriod = session?.time_period ?? '—';
  return `${day} (${timePeriod}) ${start} - ${end}`;
};

interface Columns {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string[]) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
  onFilterChange?: (key: string, value: any) => void;
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canInviteDoctors?: boolean;
  canSendPaymentWhatsapp?: boolean;
  canSendInvoiceWhatsapp?: boolean;
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
  canView = true,
  canEdit = false,
  canDelete = false,
  canInviteDoctors = false,
  canSendPaymentWhatsapp = false,
  canSendInvoiceWhatsapp = false,
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
  ...(canView || canEdit || canDelete || canInviteDoctors || canSendPaymentWhatsapp || canSendInvoiceWhatsapp
    ? [{
    title: <></>,
    dataIndex: 'actions',
    key: 'actions',
    width: 200,
    render: (_: any, row: any) => {
      const source = row?.reservation_source;
      const clientMobile = getReservationClientMobile(row);
      const invoiceWhatsappEnabled =
        canSendInvoiceWhatsapp && canSendInvoiceWhatsappForRow(row);
      const invoiceWhatsappDisabledReason = getSendInvoiceWhatsappDisabledReason(row);
      const paymentWhatsappEnabled =
        canSendPaymentWhatsapp && !shouldHidePaymentLink(row);
      const paymentWhatsappDisabledReason = getPaymentWhatsappDisabledReason(row);

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

      const handleSendInvoiceWhatsapp = async () => {
        const mobile = clientMobile;
        if (
          mobile &&
          !window.confirm(`Send invoice PDF to ${mobile}?`)
        ) {
          return;
        }

        try {
          await client.reservations.sendInvoiceWhatsapp(row.id);
          toast.success('Invoice is being sent to the client on WhatsApp.');
        } catch (error: any) {
          toast.error(
            error?.response?.data?.message ||
              'Failed to send invoice via WhatsApp'
          );
        }
      };

      return (
        <div className="flex items-center gap-3">
          <Tooltip
            size="sm"
            content={() => 'View'}
            placement="top"
            color="invert"
          >
            <CreateButton
              customSize="960px"
              icon={
                <ActionIcon tag="span" size="sm" variant="outline">
                  <EyeIcon className="h-4 w-4" />
                </ActionIcon>
              }
              view={
                <ReservationViewModal
                  reservation={row}
                  canEdit={canEdit}
                  canSendPaymentWhatsapp={canSendPaymentWhatsapp}
                  canSendInvoiceWhatsapp={canSendInvoiceWhatsapp}
                />
              }
              label=""
              className="m-0 bg-transparent p-0 text-gray-700"
            />
          </Tooltip>

          {canEdit && (
            <Tooltip size="sm" content={() => 'Edit'} placement="top" color="invert">
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
          )}

          {canSendPaymentWhatsapp && (
            <Tooltip
              size="sm"
              content={() =>
                paymentWhatsappEnabled
                  ? 'Send Payment WhatsApp'
                  : paymentWhatsappDisabledReason ?? 'Send Payment WhatsApp'
              }
              placement="top"
              color="invert"
            >
              <ActionIcon
                tag={paymentWhatsappEnabled ? 'button' : 'span'}
                size="sm"
                variant="outline"
                className={cn(
                  paymentWhatsappEnabled
                    ? 'cursor-pointer hover:text-gray-700'
                    : 'cursor-not-allowed text-gray-300'
                )}
                {...(paymentWhatsappEnabled && { onClick: handleWhatsAppPayment })}
              >
                <ChatSolidIcon className="h-4 w-4" />
              </ActionIcon>
            </Tooltip>
          )}

          {canSendInvoiceWhatsapp && (
            <Tooltip
              size="sm"
              content={() =>
                invoiceWhatsappEnabled
                  ? 'Send invoice on WhatsApp'
                  : invoiceWhatsappDisabledReason ?? 'Send invoice on WhatsApp'
              }
              placement="top"
              color="invert"
            >
              <ActionIcon
                tag={invoiceWhatsappEnabled ? 'button' : 'span'}
                size="sm"
                variant="outline"
                className={cn(
                  invoiceWhatsappEnabled
                    ? 'cursor-pointer text-emerald-600 hover:text-emerald-700'
                    : 'cursor-not-allowed text-gray-300'
                )}
                {...(invoiceWhatsappEnabled && { onClick: handleSendInvoiceWhatsapp })}
              >
                <PiReceipt className="h-4 w-4" />
              </ActionIcon>
            </Tooltip>
          )}

          {canInviteDoctors && <InviteDoctorsButton reservationId={row.id} />}

          {canDelete && (
            <DeletePopover
              title={`Delete Reservation`}
              description={`Are you sure you want to delete reservation #${row.id}?`}
              onDelete={() => onDeleteItem([row.id])}
            >
              <ActionIcon size="sm" variant="outline" className="hover:text-gray-700">
                <TrashIcon className="h-4 w-4" />
              </ActionIcon>
            </DeletePopover>
          )}

          {source === 'Application' && (
            <Tooltip size="sm" content={() => 'Application'} placement="top" color="invert">
              <ActionIcon
                tag="span"
                size="sm"
                variant="outline"
                className="cursor-default text-indigo-600"
              >
                <PiDeviceMobile className="h-4 w-4" />
              </ActionIcon>
            </Tooltip>
          )}
          {source === 'Website' && (
            <Tooltip size="sm" content={() => 'Website'} placement="top" color="invert">
              <ActionIcon
                tag="span"
                size="sm"
                variant="outline"
                className="cursor-default text-sky-600"
              >
                <PiGlobe className="h-4 w-4" />
              </ActionIcon>
            </Tooltip>
          )}
        </div>
      );
    },
  }]
    : []),
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
      const patientName = getReservationPatientName(row);

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
      return resolveLocalizedNameOrFallback(row.doctor.name);
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
      return resolveLocalizedNameOrFallback(row.service.name);
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
      const fromAddress = resolveLocalizedName(row?.address?.city);
      const fromPatient = resolveLocalizedName(row?.patient?.city?.name);
      return fromAddress || fromPatient || '—';
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
      const fromAddress = resolveLocalizedName(row?.address?.state);
      const fromPatient = resolveLocalizedName(row?.patient?.state?.name ?? row?.patient?.state);
      return fromAddress || fromPatient || '—';
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
    render: (status_label: string, row: any) => {
      const paymentStatusBadge = getPaymentStatusBadgeLabel(row?.payment_status);

      return (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <Badge variant="outline">{status_label ?? '—'}</Badge>
          {paymentStatusBadge && (
            <Badge
              variant="outline"
              className={getPaymentStatusBadgeClasses(row?.payment_status)}
            >
              {paymentStatusBadge}
            </Badge>
          )}
        </div>
      );
    },
  },

  // ✅ Payment
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="Payment" />
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
    render: (_: any, row: any) => {
      const label = getPaymentStatusLabel(row);
      if (label === '—') return '—';

      return (
        <span className={cn('text-sm font-medium', getPaymentStatusColorClass(row))}>
          {label}
        </span>
      );
    },
  },

  // ✅ Customer Tier
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="Customer Tier" />
        {onFilterChange && (
          <ColumnFilterPopover
            columnKey="customer_tier"
            onFilterChange={onFilterChange}
          />
        )}
      </div>
    ),
    dataIndex: 'customer_tier',
    key: 'customer_tier',
    render: (customer_tier: string | null | undefined) => {
      const value = (customer_tier || '').trim();
      if (!value) return '—';
      let colorClasses =
        // عادي (default)
        'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border border-gray-200 ring-1 ring-gray-100 shadow-sm';
      let symbol = '🙂';
      if (value === 'فضي') {
        colorClasses =
          'bg-gradient-to-r from-slate-50 to-zinc-100 text-slate-800 border border-slate-200 ring-1 ring-slate-100 shadow-sm';
        symbol = '🥈';
      } else if (value === 'ذهبي') {
        colorClasses =
          'bg-gradient-to-r from-amber-50 to-yellow-100 text-amber-900 border border-amber-200 ring-1 ring-amber-100 shadow-sm';
        symbol = '🥇';
      } else if (value === 'VIP') {
        colorClasses =
          'bg-gradient-to-r from-fuchsia-50 to-purple-100 text-purple-900 border border-purple-200 ring-1 ring-purple-100 shadow-sm';
        symbol = '👑';
      }
      return (
        <Badge
          variant="outline"
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${colorClasses}`}
        >
          <span aria-hidden>{symbol}</span>
          <span>{value}</span>
        </Badge>
      );
    },
  },

  // ✅ Seen
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="Seen" />
        {onFilterChange && (
          <ColumnFilterPopover
            columnKey="seen"
            onFilterChange={onFilterChange}
          />
        )}
      </div>
    ),
    dataIndex: 'seen',
    key: 'seen',
    render: (seen: boolean | null | undefined) => {
      if (seen === null || seen === undefined) return '—';
      return seen ? 'Yes' : 'No';
    },
  },

  // ✅ Rework
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="Rework" />
        {onFilterChange && (
          <ColumnFilterPopover
            columnKey="rework"
            onFilterChange={onFilterChange}
          />
        )}
      </div>
    ),
    dataIndex: 'rework',
    key: 'rework',
    render: (rework: number | null | undefined) => {
      const value = Number(rework ?? 0);
      if (value <= 0) return '0';
      return (
        <Badge variant="flat" color="warning">
          {value}
        </Badge>
      );
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
    width: 260,
    render: (notes: string | null | undefined) => {
      if (!notes || !notes.trim()) return '—';

      const normalizedNotes = notes.trim();
      const preview = truncateText(normalizedNotes, 90);
      const isTruncated = preview !== normalizedNotes;

      if (!isTruncated) {
        return (
          <span className="block max-w-[240px] truncate text-sm text-gray-700">
            {preview}
          </span>
        );
      }

      return (
        <Tooltip
          size="sm"
          placement="top"
          color="invert"
          content={() => normalizedNotes}
        >
          <span className="block max-w-[240px] truncate text-sm text-gray-700">
            {preview}
          </span>
        </Tooltip>
      );
    },
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
    width: 280,
    render: (_: any, row: any) => {
      const sessions = row?.dates;
      if (!sessions || !Array.isArray(sessions) || sessions.length === 0)
        return '—';

      const visibleSessions = sessions.slice(0, 2);
      const remainingSessionsCount = sessions.length - visibleSessions.length;
      const allSessionsText = sessions.map(formatSessionLabel).join('\n');

      return (
        <Tooltip
          size="sm"
          placement="top"
          color="invert"
          content={() => (
            <div className="max-w-[420px] whitespace-pre-line text-left">
              {allSessionsText}
            </div>
          )}
        >
          <div className="flex max-w-[260px] flex-col items-center gap-1">
            {visibleSessions.map((session: any, index: number) => (
              <span
                key={`${index}-${session?.id ?? index}`}
                className="w-full truncate rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-700"
              >
                {formatSessionLabel(session)}
              </span>
            ))}
            {remainingSessionsCount > 0 && (
              <span className="text-xs font-medium text-gray-500">
                +{remainingSessionsCount} more session
                {remainingSessionsCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </Tooltip>
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
