'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  PiMagnifyingGlassBold,
  PiXBold,
  PiCalendarBold,
  PiArrowCounterClockwiseBold,
} from 'react-icons/pi';
import cn from '@/utils/class-names';

export interface StatisticsFilters {
  date_from?: string;
  date_to?: string;
}

interface StatisticsFiltersProps {
  onFilter: (filters: StatisticsFilters) => void;
  className?: string;
}

/** Returns { date_from, date_to } for the last 10 days (today inclusive). */
function getLast10DaysRange(): { date_from: string; date_to: string } {
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 10);
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  return { date_from: fmt(from), date_to: fmt(today) };
}

export default function StatisticsFiltersComponent({
  onFilter,
  className,
}: StatisticsFiltersProps) {
  const defaults = useMemo(() => getLast10DaysRange(), []);

  const [dateFrom, setDateFrom] = useState(defaults.date_from);
  const [dateTo, setDateTo] = useState(defaults.date_to);

  // Auto-apply the default date range on first render
  useEffect(() => {
    onFilter({ date_from: defaults.date_from, date_to: defaults.date_to });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = () => {
    const filters: StatisticsFilters = {};
    if (dateFrom) filters.date_from = dateFrom;
    if (dateTo) filters.date_to = dateTo;
    onFilter(filters);
  };

  const handleReset = () => {
    setDateFrom(defaults.date_from);
    setDateTo(defaults.date_to);
    onFilter({ date_from: defaults.date_from, date_to: defaults.date_to });
  };

  const handleLast10Days = () => {
    setDateFrom(defaults.date_from);
    setDateTo(defaults.date_to);
    onFilter({ date_from: defaults.date_from, date_to: defaults.date_to });
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800',
        className
      )}
    >
      {/* Icon label */}
      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
        <PiCalendarBold className="h-4 w-4 shrink-0" />
        <span className="hidden text-xs font-semibold uppercase tracking-wider sm:block">
          Date
        </span>
      </div>

      {/* Date From */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400 dark:text-gray-500">From</span>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-auto"
          inputClassName="h-8 rounded-lg border-gray-200 text-sm dark:border-gray-600 focus:ring-blue-500 py-1 px-2"
        />
      </div>

      {/* Divider */}
      <span className="text-gray-300 dark:text-gray-600">→</span>

      {/* Date To */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400 dark:text-gray-500">To</span>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="w-auto"
          inputClassName="h-8 rounded-lg border-gray-200 text-sm dark:border-gray-600 focus:ring-blue-500 py-1 px-2"
        />
      </div>

      {/* Quick: Last 10 days */}
      <button
        type="button"
        onClick={handleLast10Days}
        className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
      >
        <PiArrowCounterClockwiseBold className="h-3.5 w-3.5" />
        Last 10 days
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Reset */}
      <Button
        variant="text"
        size="sm"
        onClick={handleReset}
        className="h-8 gap-1 text-xs text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
      >
        <PiXBold className="h-3.5 w-3.5" />
        Reset
      </Button>

      {/* Apply */}
      <Button
        size="sm"
        onClick={handleApplyFilters}
        className="h-8 gap-1 bg-gray-900 px-4 text-xs text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900"
      >
        <PiMagnifyingGlassBold className="h-3.5 w-3.5" />
        Apply
      </Button>
    </div>
  );
}
