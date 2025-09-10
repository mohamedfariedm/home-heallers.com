'use client';

import React, { useState } from 'react';
import { PiTrashDuotone } from 'react-icons/pi';
import DateFiled from '@/components/controlled-table/date-field';
import StatusField from '@/components/controlled-table/status-field';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/format-date';
import { useMedia } from '@/hooks/use-media';
import { Title, Text } from '@/components/ui/text';


const statusOptions = [
  {
    value: 'active',
    name: 'active',
    label: (
      <div className="flex items-center">
        <Text className="ms-2 font-medium ">ACTIVE</Text>
      </div>
    ),
  },
  {
    value: 'inactive',
    name: 'inactive',
    label: (
      <div className="flex items-center">
        <Text className="ms-2 font-medium ">IN ACTIVE</Text>
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
}: FilterElementProps) {
  const isMediumScreen = useMedia('(max-width: 1860px)', false);
  const handleReset = () => {
    Object.keys(filters).forEach((filter: string) => updateFilter(filter, ''))
  }
  return (
    <>
            <StatusField
        options={statusOptions}
        value={filters['activation']}
        onChange={(value: string) => {
          updateFilter('activation', value);
        }}
        getOptionValue={(option) => option.value}
        displayValue={(selected: string) =>
          statusOptions.find((option) => option.value === selected)?.label ??
          selected
        }
        {...(isMediumScreen && {
          placeholder:"Activation",
          label: 'Activation',
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
