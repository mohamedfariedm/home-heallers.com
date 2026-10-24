'use client';

import { HeaderCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatMoney } from '@/app/shared/doctor-targets/status-badge';

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  failed: 'bg-red-100 text-red-700',
  canceled: 'bg-gray-100 text-gray-700',
};

export const STATUS_LABELS: Record<string, string> = {
  completed: 'Completed',
  pending: 'Pending',
  failed: 'Failed',
  canceled: 'Canceled',
};

export function normalizeStatus(status?: string | null) {
  return status === 'cancelled' ? 'canceled' : status || '';
}

export function StatusBadge({ status }: { status?: string | null }) {
  const key = normalizeStatus(status);
  return (
    <Badge className={STATUS_STYLES[key] || 'bg-gray-100 text-gray-700'}>
      {STATUS_LABELS[key] || status || '—'}
    </Badge>
  );
}

export function TypeBadge({ type }: { type?: string }) {
  const isCredit = type === 'credit';
  return (
    <Badge
      className={isCredit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}
    >
      {isCredit ? 'Credit' : 'Debit'}
    </Badge>
  );
}

export function formatPerformedBy(performedBy?: {
  type: string;
  id: number | null;
  name: string | null;
}) {
  if (!performedBy) return '—';
  if (performedBy.type === 'system') return 'System';
  const kind = performedBy.type === 'admin' ? 'Admin' : 'Client (self)';
  return performedBy.name
    ? `${kind}: ${performedBy.name}`
    : `${kind} #${performedBy.id ?? ''}`.trim();
}

export function formatDateTime(value?: string | null) {
  return value ? new Date(value).toLocaleString() : '—';
}

export const SOURCE_OPTIONS = [
  { value: 'admin_adjustment', label: 'Admin adjustment' },
  { value: 'wallet_topup', label: 'Wallet top-up' },
  { value: 'reservation_payment', label: 'Reservation payment' },
  { value: 'market_order_payment', label: 'Market order payment' },
  { value: 'market_order_refund', label: 'Market order refund' },
  { value: 'target_incentive', label: 'Target incentive' },
  { value: 'session_payment', label: 'Session payment' },
  { value: 'withdrawal_settlement', label: 'Withdrawal settlement' },
];

export const getWalletColumns = () => [
  {
    title: <HeaderCell title="ID" />,
    dataIndex: 'id',
    key: 'id',
    width: 80,
    render: (id: number) => (
      <span className="font-semibold text-gray-800">#{id}</span>
    ),
  },
  {
    title: <HeaderCell title="Date" />,
    dataIndex: 'created_at',
    key: 'created_at',
    width: 170,
    render: (value: string) => formatDateTime(value),
  },
  {
    title: <HeaderCell title="Type" />,
    dataIndex: 'type',
    key: 'type',
    width: 90,
    render: (type: string) => <TypeBadge type={type} />,
  },
  {
    title: <HeaderCell title="Amount (SAR)" />,
    dataIndex: 'amount',
    key: 'amount',
    width: 130,
    render: (amount: number, row: any) => (
      <span
        className={`font-medium ${row.type === 'credit' ? 'text-green-700' : 'text-red-600'}`}
      >
        {row.type === 'credit' ? '+' : '−'}
        {formatMoney(amount)}
      </span>
    ),
  },
  {
    title: <HeaderCell title="Balance" />,
    dataIndex: 'balance_after',
    key: 'balance',
    width: 150,
    render: (_: any, row: any) => (
      <span className="text-gray-600">
        {formatMoney(row.balance_before)} → {formatMoney(row.balance_after)}
      </span>
    ),
  },
  {
    title: <HeaderCell title="Status" />,
    dataIndex: 'status',
    key: 'status',
    width: 110,
    render: (status: string) => <StatusBadge status={status} />,
  },
  {
    title: <HeaderCell title="Source" />,
    dataIndex: 'source_label',
    key: 'source',
    width: 170,
    render: (label: string) => label || '—',
  },
  {
    title: <HeaderCell title="Performed by" />,
    dataIndex: 'performed_by',
    key: 'performed_by',
    width: 200,
    render: (value: any) => formatPerformedBy(value),
  },
  {
    title: <HeaderCell title="Reason / description" />,
    dataIndex: 'description',
    key: 'description',
    width: 240,
    render: (value: string | null) => (
      <span className="line-clamp-2 text-gray-600" title={value || undefined}>
        {value || '—'}
      </span>
    ),
  },
];
