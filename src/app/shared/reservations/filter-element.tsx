'use client';

import React, { useState, useEffect } from 'react';
import { PiTrashDuotone } from 'react-icons/pi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';

type FilterElementProps = {
  isFiltered: boolean;
  filters: { [key: string]: any };
  updateFilter: (columnId: string, filterValue: string | any[]) => void;
  handleReset: () => void;
  onDateChange?: (dates: { date_from?: string; date_to?: string }) => void;
  currentDates?: { date_from?: string; date_to?: string };
};

export default function FilterElement({
  isFiltered,
  filters,
  updateFilter,
  handleReset,
  onDateChange,
  currentDates,
}: FilterElementProps) {
  const searchParams = useSearchParams();
  const [dateFrom, setDateFrom] = useState(currentDates?.date_from || searchParams.get('date_from') || '');
  const [dateTo, setDateTo] = useState(currentDates?.date_to || searchParams.get('date_to') || '');

  // Sync date state with URL params on mount
  useEffect(() => {
    const urlDateFrom = searchParams.get('date_from') || '';
    const urlDateTo = searchParams.get('date_to') || '';
    if (urlDateFrom !== dateFrom) {
      setDateFrom(urlDateFrom);
    }
    if (urlDateTo !== dateTo) {
      setDateTo(urlDateTo);
    }
  }, []);

  // Sync with currentDates prop when it changes
  useEffect(() => {
    if (currentDates) {
      if (currentDates.date_from !== dateFrom) {
        setDateFrom(currentDates.date_from || '');
      }
      if (currentDates.date_to !== dateTo) {
        setDateTo(currentDates.date_to || '');
      }
    }
  }, [currentDates]);

  const handleDateChange = (field: 'date_from' | 'date_to', value: string) => {
    // Only update local state, don't apply to URL yet
    // Dates will be applied when user clicks "Apply Filters" button
    if (field === 'date_from') {
      setDateFrom(value);
    } else {
      setDateTo(value);
    }
    
    // Notify parent of the change (stored in state, not applied yet)
    if (onDateChange) {
      onDateChange({
        date_from: field === 'date_from' ? (value || undefined) : (dateFrom || undefined),
        date_to: field === 'date_to' ? (value || undefined) : (dateTo || undefined),
      });
    }
  };

  const handleResetAll = () => {
    // Reset local date state
    setDateFrom('');
    setDateTo('');
    
    // Notify parent to clear dates
    if (onDateChange) {
      onDateChange({ date_from: undefined, date_to: undefined });
    }
    
    // Also reset table filters
    handleReset();
  };

  return (
    <>
      {/* Date Filters - Will apply when "Apply Filters" button is clicked */}
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

      {/* Clear button - only show if dates are selected */}
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
