'use client';

import React, { useState } from 'react';
import { PiTrashDuotone } from 'react-icons/pi';
import StatusField from '@/components/controlled-table/status-field';
import { Button } from '@/components/ui/button';
import { useMedia } from '@/hooks/use-media';
import { Title, Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';

const statusOptions = [
  {
    value: 'active',
    name: 'active',
    label: (
      <div className="flex items-center">
        <Text className="ms-2 font-medium">ACTIVE</Text>
      </div>
    ),
  },
  {
    value: 'inactive',
    name: 'inactive',
    label: (
      <div className="flex items-center">
        <Text className="ms-2 font-medium">INACTIVE</Text>
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
  const isMediumScreen = useMedia('(max-width: 1860px)', false);

  return (
    <>
      <StatusField
        options={statusOptions}
        placeholder="Status"
        value={filters['status']}
        onChange={(value: string) => {
          updateFilter('status', value);
        }}
        getOptionValue={(option: { value: string }) => option.value}
        displayValue={(selected: string) =>
          statusOptions.find((option) => option.value === selected)?.name || ''
        }
      />

      <Input
        placeholder="Search by name"
        value={filters['name'] || ''}
        onChange={(e) => {
          updateFilter('name', e.target.value);
        }}
        className="w-full"
      />

      <Input
        placeholder="Search by phone"
        value={filters['phone'] || ''}
        onChange={(e) => {
          updateFilter('phone', e.target.value);
        }}
        className="w-full"
      />

      <Input
        placeholder="Search by email"
        value={filters['email'] || ''}
        onChange={(e) => {
          updateFilter('email', e.target.value);
        }}
        className="w-full"
      />

      {isFiltered && (
        <Button
          size="sm"
          onClick={handleReset}
          className="h-8 bg-gray-200/70"
          variant="flat"
        >
          <PiTrashDuotone className="me-1.5 h-[17px] w-[17px]" />
          Clear
        </Button>
      )}
    </>
  );
}
