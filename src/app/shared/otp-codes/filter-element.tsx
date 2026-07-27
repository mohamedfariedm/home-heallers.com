'use client';

import React from 'react';
import { PiTrashDuotone } from 'react-icons/pi';
import DateFiled from '@/components/controlled-table/date-field';
import StatusField from '@/components/controlled-table/status-field';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { formatDate } from '@/utils/format-date';
import { useMedia } from '@/hooks/use-media';

const typeOptions = [
  {
    value: 'client',
    name: 'client',
    label: (
      <div className="flex items-center">
        <Text className="ms-2 font-medium">Client</Text>
      </div>
    ),
  },
  {
    value: 'doctor',
    name: 'doctor',
    label: (
      <div className="flex items-center">
        <Text className="ms-2 font-medium">Doctor</Text>
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
  filters,
  updateFilter,
  handleReset,
}: FilterElementProps) {
  const isMediumScreen = useMedia('(max-width: 1860px)', false);

  return (
    <>
      <StatusField
        options={typeOptions}
        placeholder="Actor type"
        value={filters['type']}
        onChange={(value: string) => {
          updateFilter('type', value);
        }}
        getOptionValue={(option) => option.value}
        displayValue={(selected: string) =>
          typeOptions.find((option) => option.value === selected)?.label ??
          selected
        }
        {...(isMediumScreen && {
          label: 'Type',
          labelClassName: 'font-medium text-gray-700',
        })}
      />
      <div className="flex gap-2">
        <DateFiled
          selected={filters['date_from'] ? new Date(filters['date_from']) : null}
          onChange={(date: any) => {
            updateFilter('date_from', formatDate(date, 'YYYY-MM-DD'));
          }}
          placeholderText="Select start date"
          {...(isMediumScreen && {
            inputProps: {
              label: 'From Date',
              labelClassName: 'font-medium text-gray-700',
            },
          })}
        />
        <DateFiled
          selected={filters['date_to'] ? new Date(filters['date_to']) : null}
          onChange={(date: any) => {
            updateFilter('date_to', formatDate(new Date(date), 'YYYY-MM-DD'));
          }}
          placeholderText="Select to date"
          {...(isMediumScreen && {
            inputProps: {
              label: 'To Date',
              labelClassName: 'font-medium text-gray-700',
            },
          })}
        />
      </div>
      <Button
        size="sm"
        onClick={handleReset}
        className="h-8 bg-gray-200/70"
        variant="flat"
      >
        <PiTrashDuotone className="me-1.5 h-[17px] w-[17px]" /> Clear
      </Button>
    </>
  );
}
