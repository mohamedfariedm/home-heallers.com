'use client';

import { HeaderCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import CreateButton from '@/app/shared/create-button';
import SettleWithdrawalDialog from './settle-dialog';
import RejectWithdrawalDialog from './reject-dialog';
import { formatMoney } from '@/app/shared/doctor-targets/status-badge';
import type { WithdrawalsPermissions } from './permissions';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  approved: 'Settled',
  rejected: 'Rejected',
};

interface Columns {
  permissions: WithdrawalsPermissions;
}

export const getWithdrawalColumns = ({ permissions }: Columns) => [
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
    dataIndex: 'doctor_id',
    key: 'doctor_id',
    width: 110,
    render: (id: number) => <span>#{id}</span>,
  },
  {
    title: <HeaderCell title="Amount" />,
    dataIndex: 'amount',
    key: 'amount',
    width: 120,
    render: (amount: number) => formatMoney(amount),
  },
  {
    title: <HeaderCell title="Status" />,
    dataIndex: 'status',
    key: 'status',
    width: 120,
    render: (status: string) => (
      <Badge className={STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'}>
        {STATUS_LABELS[status] || status}
      </Badge>
    ),
  },
  {
    title: <HeaderCell title="Wallet txn" />,
    dataIndex: 'wallet_transaction_id',
    key: 'wallet_transaction_id',
    width: 110,
    render: (id: number | null) => (id != null ? `#${id}` : '—'),
  },
  {
    title: <HeaderCell title="Reviewed" />,
    dataIndex: 'reviewed_at',
    key: 'reviewed_at',
    width: 160,
    render: (value: string | null) =>
      value ? new Date(value).toLocaleString() : '—',
  },
  {
    title: <HeaderCell title="Actions" />,
    dataIndex: 'actions',
    key: 'actions',
    width: 220,
    render: (_: any, row: any) => {
      if (row.status !== 'pending') {
        return (
          <span className="text-xs text-gray-500">
            {row.rejection_reason || '—'}
          </span>
        );
      }
      return (
        <div className="flex flex-wrap gap-2">
          {permissions.settle && (
            <CreateButton
              label="Settle"
              icon={null}
              view={<SettleWithdrawalDialog withdrawal={row} />}
              className="h-8"
              customSize="520px"
            />
          )}
          {permissions.reject && (
            <CreateButton
              label="Reject"
              icon={null}
              view={<RejectWithdrawalDialog withdrawal={row} />}
              className="h-8 bg-red-600 hover:bg-red-700"
            />
          )}
        </div>
      );
    },
  },
];
