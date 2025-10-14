'use client';

import React from 'react';
import { PiTrashDuotone } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useMedia } from '@/hooks/use-media';
import DateFiled from '@/components/controlled-table/date-field';
import StatusField from '@/components/controlled-table/status-field';
import { formatDate } from '@/utils/format-date';

const statusOptions = [
  {
    value: 'active',
    name: 'active',
    label: (
      <div className="flex items-center">
        <Text className="ms-2 font-medium text-green-700">ACTIVE</Text>
      </div>
    ),
  },
  {
    value: 'inactive',
    name: 'inactive',
    label: (
      <div className="flex items-center">
        <Text className="ms-2 font-medium text-gray-500">INACTIVE</Text>
      </div>
    ),
  },
];

type FilterElementProps = {
  isFiltered: boolean;
  filters: { [key: string]: any };
  updateFilter: (columnId: string, filterValue: string | any[]) => void;
  handleReset: () => void;
};

export default function FilterElement({
  isFiltered,
  filters,
  updateFilter,
  handleReset,
}: FilterElementProps) {
  const isMediumScreen = useMedia('(max-width: 1024px)', false);

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-gray-50 p-4 md:p-5 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {/* 🧾 Invoice Number */}
        <Input
          placeholder="Invoice Number"
          className="h-9 w-full"
          value={filters['invoice_number'] ?? ''}
          onChange={(e) => updateFilter('invoice_number', e.target.value)}
        />

        {/* 👩 Customer Name */}
        <Input
          placeholder="Customer Name"
          className="h-9 w-full"
          value={filters['customer_name'] ?? ''}
          onChange={(e) => updateFilter('customer_name', e.target.value)}
        />

        {/* 🧰 Service Name */}
        <Input
          placeholder="Service Name"
          className="h-9 w-full"
          value={filters['service_name'] ?? ''}
          onChange={(e) => updateFilter('service_name', e.target.value)}
        />

        {/* 🗓️ Invoice Date */}
        <DateFiled
          className="w-full"
          placeholderText="Invoice Date"
          selected={
            filters['invoice_date']
              ? new Date(filters['invoice_date'])
              : undefined
          }
          onChange={(date: Date | null) =>
            updateFilter(
              'invoice_date',
              date ? formatDate(date, 'YYYY-MM-DD') : ''
            )
          }
        />

        {/* ⚙️ Activation Status */}
        {/* Uncomment if you want status filter visible */}
        {/* <StatusField
          options={statusOptions}
          value={filters['activation']}
          onChange={(value: string) => updateFilter('activation', value)}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            statusOptions.find((o) => o.value === selected)?.label ?? selected
          }
          {...(isMediumScreen && {
            placeholder: 'Activation',
            label: 'Activation',
            labelClassName: 'font-medium text-gray-700',
          })}
        /> */}

        {/* 🧹 Clear All (takes full width below grid) */}
        <div className="sm:col-span-2 mt-2">
          <Button
            size="sm"
            onClick={handleReset}
            className="h-9 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
            variant="outline"
          >
            <PiTrashDuotone className="me-1.5 h-[17px] w-[17px]" /> Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
