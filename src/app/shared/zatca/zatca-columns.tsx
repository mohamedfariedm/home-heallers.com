'use client';

import Link from 'next/link';
import { HeaderCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from '@/components/ui/action-icon';
import { Tooltip } from '@/components/ui/tooltip';
import EyeIcon from '@/components/icons/eye';
import DateCell from '@/components/ui/date-cell';
import StatusBadge from '@/app/shared/zatca/status-badge';
import type { ZatcaPermissions } from '@/app/shared/zatca/permissions';
import type { ZatcaInvoice } from '@/types/zatca';
import { formatDate } from '@/utils/format-date';

type Columns = {
  data: ZatcaInvoice[];
  sortConfig?: { key: string | null; direction: string | null };
  handleSelectAll: () => void;
  checkedItems: string[];
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
  permissions: ZatcaPermissions;
};

export function getZatcaColumns({
  data,
  sortConfig,
  checkedItems,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
  permissions,
}: Columns) {
  return [
    {
      title: (
        <div className="ps-2">
          <Checkbox
            title="Select All"
            onChange={handleSelectAll}
            checked={data.length > 0 && checkedItems.length === data.length}
            className="cursor-pointer"
          />
        </div>
      ),
      dataIndex: 'checked',
      key: 'checked',
      width: 40,
      render: (_: unknown, row: ZatcaInvoice) => (
        <Checkbox
          className="cursor-pointer"
          checked={checkedItems.includes(String(row.id))}
          {...(onChecked && { onChange: () => onChecked(String(row.id)) })}
        />
      ),
    },
    {
      title: <></>,
      dataIndex: 'action',
      key: 'action',
      width: 50,
      render: (_: unknown, row: ZatcaInvoice) =>
        permissions.view ? (
          <Tooltip content={() => 'View'} placement="top" color="invert">
            <Link href={`/invoices/${row.id}`}>
              <ActionIcon size="sm" variant="outline" tag="span">
                <EyeIcon className="h-4 w-4" />
              </ActionIcon>
            </Link>
          </Tooltip>
        ) : null,
    },
    {
      title: <HeaderCell title="Invoice #" />,
      dataIndex: 'invoice_number',
      key: 'invoice_number',
      width: 120,
      render: (_: string, row: ZatcaInvoice) =>
        permissions.view ? (
          <Link href={`/invoices/${row.id}`} className="font-medium text-blue-600 hover:underline">
            {row.invoice_number}
          </Link>
        ) : (
          row.invoice_number
        ),
    },
    {
      title: <HeaderCell title="Type" />,
      dataIndex: 'document_type',
      key: 'document_type',
      width: 100,
      render: (_: string, row: ZatcaInvoice) => (
        <StatusBadge kind="document" value={row.document_type} />
      ),
    },
    {
      title: <HeaderCell title="Customer" />,
      dataIndex: 'customer_name',
      key: 'customer_name',
      width: 140,
      render: (v: string) => <span className="line-clamp-1">{v}</span>,
    },
    {
      title: (
        <HeaderCell
          title="Date"
          sortable
          ascending={
            sortConfig?.direction === 'asc' && sortConfig?.key === 'invoice_date'
          }
        />
      ),
      onHeaderCell: () => onHeaderCellClick('invoice_date'),
      dataIndex: 'invoice_date',
      key: 'invoice_date',
      width: 100,
      render: (v: string) => <DateCell date={v} />,
    },
    {
      title: <HeaderCell title="Total" align="center" />,
      dataIndex: 'grand_total',
      key: 'grand_total',
      width: 90,
      render: (v: number) => <div className="text-center">{v} ر.س</div>,
    },
    {
      title: <HeaderCell title="Business" />,
      dataIndex: 'business_status',
      key: 'business_status',
      width: 100,
      render: (_: string, row: ZatcaInvoice) => (
        <StatusBadge kind="business" value={row.business_status} />
      ),
    },
    {
      title: <HeaderCell title="ZATCA" />,
      dataIndex: 'zatca_status',
      key: 'zatca_status',
      width: 120,
      render: (_: string, row: ZatcaInvoice) => (
        <StatusBadge kind="zatca" value={row.zatca_status} />
      ),
    },
    {
      title: <HeaderCell title="Validation" align="center" />,
      dataIndex: 'validation_status',
      key: 'validation_status',
      width: 70,
      render: (_: string, row: ZatcaInvoice) => (
        <div className="flex justify-center">
          <StatusBadge kind="validation" value={row.validation_status} />
        </div>
      ),
    },
    {
      title: <HeaderCell title="Submitted" />,
      dataIndex: 'zatca_submitted_at',
      key: 'zatca_submitted_at',
      width: 110,
      render: (v: string | undefined) =>
        v ? (
          <span className="text-xs text-gray-600" title={v}>
            {formatDate(new Date(v), 'DD MMM, YYYY HH:mm')}
          </span>
        ) : (
          '—'
        ),
    },
  ];
}
