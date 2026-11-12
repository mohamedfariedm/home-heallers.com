'use client';

import React, { useState, useEffect } from 'react';
import { PiTrashDuotone } from 'react-icons/pi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type FilterElementProps = {
  isFiltered: boolean;
  filters: { [key: string]: any };
  updateFilter: (columnId: string, filterValue: string | any[]) => void;
  handleReset: () => void;
  onDateChange?: (dates: { date_from?: string; date_to?: string }) => void;
  /** Immediately clear dates in the URL (sets all_dates=1). */
  onClearDates?: () => void;
  currentDates?: { date_from?: string; date_to?: string };
};

export default function FilterElement({
  handleReset,
  onDateChange,
  onClearDates,
  currentDates,
}: FilterElementProps) {
  const [dateFrom, setDateFrom] = useState(currentDates?.date_from || '');
  const [dateTo, setDateTo] = useState(currentDates?.date_to || '');

  // Keep inputs in sync with applied dates from the parent/URL
  useEffect(() => {
    setDateFrom(currentDates?.date_from || '');
    setDateTo(currentDates?.date_to || '');
  }, [currentDates?.date_from, currentDates?.date_to]);

  const handleDateChange = (field: 'date_from' | 'date_to', value: string) => {
    if (field === 'date_from') {
      setDateFrom(value);
    } else {
      setDateTo(value);
    }

    onDateChange?.({
      date_from: field === 'date_from' ? value || undefined : dateFrom || undefined,
      date_to: field === 'date_to' ? value || undefined : dateTo || undefined,
    });
  };

  const handleResetAll = () => {
    setDateFrom('');
    setDateTo('');
    onDateChange?.({ date_from: undefined, date_to: undefined });

    if (onClearDates) {
      onClearDates();
      return;
    }

    handleReset();
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => handleDateChange('date_from', e.target.value)}
          placeholder="Date From"
          className="w-40"
          inputClassName="border-gray-200 dark:border-gray-700 focus:ring-[#143087] rounded-lg h-8 text-xs"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => handleDateChange('date_to', e.target.value)}
          placeholder="Date To"
          className="w-40"
          inputClassName="border-gray-200 dark:border-gray-700 focus:ring-[#143087] rounded-lg h-8 text-xs"
        />
      </div>

      {(dateFrom || dateTo) && (
        <Button
          size="sm"
          onClick={handleResetAll}
          className="h-8 bg-gray-200/70"
          variant="flat"
        >
          <PiTrashDuotone className="me-1.5 h-[17px] w-[17px]" /> Clear Dates
        </Button>
      )}
    </>
  );
}
