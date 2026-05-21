'use client';

import React, { useState, useEffect } from 'react';
import { PiTrashDuotone } from 'react-icons/pi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import StatusField from '@/components/controlled-table/status-field';
import { useSearchParams } from 'next/navigation';
import { Text } from '@/components/ui/text';
import { useMedia } from '@/hooks/use-media';

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

const genderOptions = [
  {
    value: 'male',
    name: 'male',
    label: (
      <div className="flex items-center">
        <Text className="ms-2 font-medium">MALE</Text>
      </div>
    ),
  },
  {
    value: 'female',
    name: 'female',
    label: (
      <div className="flex items-center">
        <Text className="ms-2 font-medium">FEMALE</Text>
      </div>
    ),
  },
];

type FilterElementProps = {
  isFiltered: boolean;
  filters: { [key: string]: any };
  updateFilter: (columnId: string, filterValue: string | any[]) => void;
  handleReset: () => void;
  onDateChange?: (dates: { date_from?: string; date_to?: string }) => void;
  currentDates?: { date_from?: string; date_to?: string };
};

export default function FilterElement({
  filters,
  updateFilter,
  handleReset,
  onDateChange,
  currentDates,
}: FilterElementProps) {
  const searchParams = useSearchParams();
  const isMediumScreen = useMedia('(max-width: 1860px)', false);
  const [dateFrom, setDateFrom] = useState(currentDates?.date_from || searchParams.get('date_from') || '');
  const [dateTo, setDateTo] = useState(currentDates?.date_to || searchParams.get('date_to') || '');

  useEffect(() => {
    const urlDateFrom = searchParams.get('date_from') || '';
    const urlDateTo = searchParams.get('date_to') || '';
    if (urlDateFrom !== dateFrom) setDateFrom(urlDateFrom);
    if (urlDateTo !== dateTo) setDateTo(urlDateTo);
  }, []);

  useEffect(() => {
    if (currentDates) {
      if (currentDates.date_from !== dateFrom) setDateFrom(currentDates.date_from || '');
      if (currentDates.date_to !== dateTo) setDateTo(currentDates.date_to || '');
    }
  }, [currentDates]);

  const handleDateChange = (field: 'date_from' | 'date_to', value: string) => {
    if (field === 'date_from') setDateFrom(value);
    else setDateTo(value);
    if (onDateChange) {
      onDateChange({
        date_from: field === 'date_from' ? (value || undefined) : (dateFrom || undefined),
        date_to: field === 'date_to' ? (value || undefined) : (dateTo || undefined),
      });
    }
  };

  const handleResetAll = () => {
    setDateFrom('');
    setDateTo('');
    if (onDateChange) onDateChange({ date_from: undefined, date_to: undefined });
    handleReset();
  };

  const fieldProps = isMediumScreen ? { labelClassName: 'font-medium text-gray-700' } : {};

  return (
    <>
      <StatusField
        options={statusOptions}
        value={filters['status']}
        onChange={(value: string) => updateFilter('status', value)}
        getOptionValue={(option) => option.value}
        displayValue={(selected: string) =>
          statusOptions.find((option) => option.value === selected)?.label ?? selected
        }
        {...(isMediumScreen && { placeholder: 'Status', label: 'Status', ...fieldProps })}
      />

      <StatusField
        options={genderOptions}
        value={filters['gender']}
        onChange={(value: string) => updateFilter('gender', value)}
        getOptionValue={(option) => option.value}
        displayValue={(selected: string) =>
          genderOptions.find((option) => option.value === selected)?.label ?? selected
        }
        {...(isMediumScreen && { placeholder: 'Gender', label: 'Gender', ...fieldProps })}
      />

      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => handleDateChange('date_from', e.target.value)}
          placeholder="Date From"
          className="w-40"
          inputClassName="border-gray-200 dark:border-gray-700 focus:ring-blue-500 rounded-lg h-8 text-xs"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => handleDateChange('date_to', e.target.value)}
          placeholder="Date To"
          className="w-40"
          inputClassName="border-gray-200 dark:border-gray-700 focus:ring-blue-500 rounded-lg h-8 text-xs"
        />
      </div>

      {(dateFrom || dateTo || filters['status'] || filters['gender']) && (
        <Button size="sm" onClick={handleResetAll} className="h-8 bg-gray-200/70" variant="flat">
          <PiTrashDuotone className="me-1.5 h-[17px] w-[17px]" /> Clear
        </Button>
      )}
    </>
  );
}
