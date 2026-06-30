'use client';

import React, { useState } from 'react';
import { PiTrashDuotone } from 'react-icons/pi';
import StatusField from '@/components/controlled-table/status-field';
import { Button } from '@/components/ui/button';
import { useMedia } from '@/hooks/use-media';
import { Text } from '@/components/ui/text';
import { COUPON_TYPES } from '@/utils/coupon-constants';

const activeOptions = [
  {
    value: '1',
    name: 'active',
    label: (
      <div className="flex items-center">
        <Text className="ms-2 font-medium">Active</Text>
      </div>
    ),
  },
  {
    value: '0',
    name: 'inactive',
    label: (
      <div className="flex items-center">
        <Text className="ms-2 font-medium">Inactive</Text>
      </div>
    ),
  },
];

const typeOptions = COUPON_TYPES.map((type) => ({
  value: type.value,
  name: type.value,
  label: (
    <div className="flex items-center">
      <Text className="ms-2 font-medium">{type.label}</Text>
    </div>
  ),
}));

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
        placeholder="Coupon type"
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
      <StatusField
        options={activeOptions}
        placeholder="Status"
        value={filters['is_active']}
        onChange={(value: string) => {
          updateFilter('is_active', value);
        }}
        getOptionValue={(option) => option.value}
        displayValue={(selected: string) =>
          activeOptions.find((option) => option.value === selected)?.label ??
          selected
        }
        {...(isMediumScreen && {
          label: 'Status',
          labelClassName: 'font-medium text-gray-700',
        })}
      />
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
