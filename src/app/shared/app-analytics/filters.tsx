'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/datepicker';
import {
  PiMagnifyingGlassBold,
  PiXBold,
  PiFunnelBold,
  PiCaretDownBold,
  PiCaretUpBold,
} from 'react-icons/pi';
import cn from '@/utils/class-names';
import {
  DATE_DISPLAY_FORMAT,
  formatIsoDate,
} from '@/app/shared/doctor-targets/dates';

export interface AppAnalyticsFilters {
  from?: string;
  to?: string;
  date?: string;
}

interface AppAnalyticsFiltersProps {
  onFilter: (filters: AppAnalyticsFilters) => void;
  className?: string;
}

export default function AppAnalyticsFiltersComponent({
  onFilter,
  className,
}: AppAnalyticsFiltersProps) {
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleApplyFilters = () => {
    const filters: AppAnalyticsFilters = {};
    const fromIso = formatIsoDate(from);
    const toIso = formatIsoDate(to);
    const dateIso = formatIsoDate(date);

    if (fromIso) filters.from = fromIso;
    if (toIso) filters.to = toIso;
    if (dateIso) filters.date = dateIso;
    onFilter(filters);
  };

  const handleReset = () => {
    setFrom(null);
    setTo(null);
    setDate(null);
    onFilter({});
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800',
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
            <PiFunnelBold className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Filters</h3>
        </div>
        <Button
          variant="text"
          size="sm"
          className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <PiCaretUpBold className="h-5 w-5" />
          ) : (
            <PiCaretDownBold className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          isOpen
            ? 'grid-rows-[1fr] opacity-100 p-5'
            : 'grid-rows-[0fr] overflow-hidden p-0 opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Date From
              </label>
              <DatePicker
                selected={from}
                onChange={(value: Date | null) => {
                  setFrom(value);
                  if (value && to && value > to) setTo(null);
                }}
                dateFormat={DATE_DISPLAY_FORMAT}
                placeholderText="dd/mm/yyyy"
                maxDate={to ?? undefined}
                inputProps={{
                  className: 'w-full',
                  inputClassName:
                    'border-gray-200 dark:border-gray-700 focus:ring-blue-500 rounded-lg',
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Date To
              </label>
              <DatePicker
                selected={to}
                onChange={(value: Date | null) => setTo(value)}
                dateFormat={DATE_DISPLAY_FORMAT}
                placeholderText="dd/mm/yyyy"
                minDate={from ?? undefined}
                inputProps={{
                  className: 'w-full',
                  inputClassName:
                    'border-gray-200 dark:border-gray-700 focus:ring-blue-500 rounded-lg',
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Active Users Date
              </label>
              <DatePicker
                selected={date}
                onChange={(value: Date | null) => setDate(value)}
                dateFormat={DATE_DISPLAY_FORMAT}
                placeholderText="dd/mm/yyyy"
                inputProps={{
                  className: 'w-full',
                  inputClassName:
                    'border-gray-200 dark:border-gray-700 focus:ring-blue-500 rounded-lg',
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">
          <Button
            variant="text"
            onClick={handleReset}
            className="text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
          >
            <PiXBold className="me-1.5 h-4 w-4" />
            Reset Filters
          </Button>
          <Button
            onClick={handleApplyFilters}
            className="bg-gray-900 px-8 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900"
          >
            <PiMagnifyingGlassBold className="me-1.5 h-4 w-4" />
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
