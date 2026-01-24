'use client';

import { useState, useEffect } from 'react';
import { PiFunnel, PiXBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import { Title } from '@/components/ui/text';
import ColumnFilterPopover from './column-filter-popover';
import cn from '@/utils/class-names';
import dynamic from 'next/dynamic';

const Drawer = dynamic(
  () => import('@/components/ui/drawer').then((module) => ({ default: module.Drawer })),
  { ssr: false }
);

const FILTERABLE_COLUMNS = [
  'name',
  'offer',
  'agent_name',
  'status',
  'reason',
  'age',
  'gender',
  'lead_source',
  'source_campaign',
  'mobile_phone',
  'booking_phone_number',
  'home_phone',
  'address_1',
  'description',
  'first_call_time',
  'last_call_result',
  'last_call_total_duration',
  'last_phone',
  'notes',
  'ads_name',
  'created_at',
  'communication_channel',
];

interface KanbanFiltersProps {
  onFilterChange: (filters: Record<string, any>) => void;
  onClearFilters: () => void;
  currentFilters?: Record<string, any>;
}

export default function KanbanFilters({ onFilterChange, onClearFilters, currentFilters = {} }: KanbanFiltersProps) {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  // Sync local filters with current applied filters when drawer opens
  useEffect(() => {
    if (isOpen) {
      // Only sync if there are actual filters, otherwise keep empty
      if (Object.keys(currentFilters).length > 0) {
        setFilters(currentFilters);
      } else {
        setFilters({});
      }
    }
  }, [isOpen, currentFilters]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      return newFilters;
    });
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    // Reset all filters to completely empty
    setFilters({});
    
    // Trigger reset of all filter popovers by changing key
    setResetKey((prev) => prev + 1);
    
    // Call parent's clear function to clear URL params
    onClearFilters();
    
    // Apply empty filters immediately to clear parent state
    onFilterChange({});
  };

  // Check both local filters and current applied filters
  const hasActiveFilters = 
    Object.keys(filters).some((key) => filters[key]?.c1?.value || filters[key]?.c2?.value) ||
    Object.keys(currentFilters).some((key) => currentFilters[key]?.c1?.value || currentFilters[key]?.c2?.value);

  const activeFilterCount = 
    Object.keys(filters).filter((key) => filters[key]?.c1?.value || filters[key]?.c2?.value).length ||
    Object.keys(currentFilters).filter((key) => currentFilters[key]?.c1?.value || currentFilters[key]?.c2?.value).length;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <PiFunnel className="h-4 w-4" />
        Filters
        {hasActiveFilters && (
          <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
            {activeFilterCount}
          </span>
        )}
      </Button>

      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        placement="right"
        size="lg"
        overlayClassName="dark:bg-opacity-40 dark:backdrop-blur-sm"
        containerClassName="dark:bg-gray-100"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
            <Title as="h5" className="font-semibold">
              Advanced Filters
            </Title>
            <ActionIcon
              size="sm"
              rounded="full"
              variant="text"
              onClick={() => setIsOpen(false)}
              className="hover:bg-gray-100 dark:hover:bg-gray-200"
            >
              <PiXBold className="h-4 w-4" />
            </ActionIcon>
          </div>

          {/* Filter Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              {FILTERABLE_COLUMNS.map((columnKey) => {
                const columnLabel = columnKey
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase());
                const hasFilter = filters[columnKey]?.c1?.value || filters[columnKey]?.c2?.value;

                return (
                  <div
                    key={columnKey}
                    className={cn(
                      'rounded-lg border p-4 transition-colors',
                      hasFilter
                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                        : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-50'
                    )}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-900 dark:text-gray-900">
                        {columnLabel}
                      </label>
                      {hasFilter && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <ColumnFilterPopover
                        key={resetKey > 0 ? `${columnKey}-${resetKey}` : columnKey}
                        columnKey={columnKey}
                        onFilterChange={handleFilterChange}
                        initialValue={resetKey > 0 ? undefined : (filters[columnKey] || currentFilters[columnKey] || undefined)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 border-t border-gray-200 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-50">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="flex-1"
                disabled={!hasActiveFilters}
              >
                Clear All
              </Button>
              <Button onClick={handleApplyFilters} className="flex-1">
                Apply Filters
                {hasActiveFilters && (
                  <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
}
