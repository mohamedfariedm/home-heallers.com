'use client';

import { PiTrashDuotone } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DateFiled from '@/components/controlled-table/date-field';
import StatusField from '@/components/controlled-table/status-field';
import { formatDate } from '@/utils/format-date';

const documentTypeOptions = [
  { value: '', name: 'all', label: 'All types' },
  { value: 'INVOICE', name: 'INVOICE', label: 'Invoice' },
  { value: 'CREDIT_NOTE', name: 'CREDIT_NOTE', label: 'Credit note' },
  { value: 'DEBIT_NOTE', name: 'DEBIT_NOTE', label: 'Debit note' },
];

const zatcaStatusOptions = [
  'NOT_SUBMITTED',
  'QUEUED',
  'SUBMITTING',
  'REPORTED',
  'CLEARED',
  'REPORTED_WITH_WARNINGS',
  'REJECTED',
  'FAILED',
].map((v) => ({
  value: v,
  name: v,
  label: v.replace(/_/g, ' '),
}));

const businessStatusOptions = ['DRAFT', 'ISSUED', 'CANCELLED'].map((v) => ({
  value: v,
  name: v,
  label: v,
}));

type Props = {
  isFiltered: boolean;
  filters: Record<string, unknown>;
  updateFilter: (columnId: string, filterValue: string | unknown[]) => void;
  handleReset: () => void;
};

export default function ZatcaFilterElement({
  filters,
  updateFilter,
  handleReset,
}: Props) {
  return (
    <div className="w-full rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm md:p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Input
          placeholder="Search number, UUID, customer…"
          className="h-9"
          value={String(filters.search ?? '')}
          onChange={(e) => updateFilter('search', e.target.value)}
        />
        <StatusField
          options={documentTypeOptions}
          value={filters.document_type as string}
          onChange={(v) =>
            updateFilter(
              'document_type',
              typeof v === 'object' && v != null && 'value' in v
                ? String((v as { value: string }).value)
                : String(v ?? '')
            )
          }
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            documentTypeOptions.find((o) => o.value === selected)?.label ?? selected
          }
          placeholder="Document type"
        />
        <StatusField
          options={zatcaStatusOptions}
          value={filters.zatca_status as string}
          onChange={(v) =>
            updateFilter(
              'zatca_status',
              typeof v === 'object' && v != null && 'value' in v
                ? String((v as { value: string }).value)
                : String(v ?? '')
            )
          }
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            zatcaStatusOptions.find((o) => o.value === selected)?.label ?? selected
          }
          placeholder="ZATCA status"
        />
        <StatusField
          options={businessStatusOptions}
          value={filters.business_status as string}
          onChange={(v) =>
            updateFilter(
              'business_status',
              typeof v === 'object' && v != null && 'value' in v
                ? String((v as { value: string }).value)
                : String(v ?? '')
            )
          }
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            businessStatusOptions.find((o) => o.value === selected)?.label ?? selected
          }
          placeholder="Business status"
        />
        <DateFiled
          className="w-full"
          placeholderText="From date"
          selected={
            filters.date_from ? new Date(String(filters.date_from)) : undefined
          }
          onChange={(date: Date | null) =>
            updateFilter('date_from', date ? formatDate(date, 'YYYY-MM-DD') : '')
          }
        />
        <DateFiled
          className="w-full"
          placeholderText="To date"
          selected={filters.date_to ? new Date(String(filters.date_to)) : undefined}
          onChange={(date: Date | null) =>
            updateFilter('date_to', date ? formatDate(date, 'YYYY-MM-DD') : '')
          }
        />
        <Input
          placeholder="Client ID"
          type="number"
          className="h-9"
          value={String(filters.client_id ?? '')}
          onChange={(e) => updateFilter('client_id', e.target.value)}
        />
      </div>
      <div className="mt-3">
        <Button
          size="sm"
          variant="outline"
          onClick={handleReset}
          className="h-9 w-full bg-gray-100 text-gray-700 sm:w-auto"
        >
          <PiTrashDuotone className="me-1.5 h-[17px] w-[17px]" /> Clear filters
        </Button>
      </div>
    </div>
  );
}
