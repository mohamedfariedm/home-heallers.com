'use client';

import { PiTrashDuotone } from 'react-icons/pi';
import DateFiled from '@/components/controlled-table/date-field';
import StatusField from '@/components/controlled-table/status-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { formatDate } from '@/utils/format-date';
import { useActivityLogFilterOptions } from '@/framework/activity-logs';
import type { ActivityLogFilterOptions } from '@/types/activity-log';

const eventOptions = [
  { value: '', name: 'all', label: 'All events' },
  { value: 'created', name: 'created', label: 'Created' },
  { value: 'updated', name: 'updated', label: 'Updated' },
  { value: 'deleted', name: 'deleted', label: 'Deleted' },
];

const dateShortcutOptions = [
  { value: '', name: 'none', label: 'No shortcut' },
  { value: 'today', name: 'today', label: 'Today' },
  { value: 'yesterday', name: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', name: 'this_week', label: 'This week' },
  { value: 'this_month', name: 'this_month', label: 'This month' },
  { value: 'last_month', name: 'last_month', label: 'Last month' },
];

type FilterElementProps = {
  filters: Record<string, unknown>;
  updateFilter: (columnId: string, filterValue: string | unknown[]) => void;
  handleReset: () => void;
};

function toSelectValue(value: unknown): string {
  if (value == null) return '';
  return String(value);
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-w-0 space-y-1.5">
      <Text className="text-sm font-medium text-gray-700">{label}</Text>
      <div className="w-full min-w-0 [&_.rizzui-select]:w-full [&_input]:w-full">
        {children}
      </div>
    </div>
  );
}

export default function ActivityLogFilterElement({
  filters,
  updateFilter,
  handleReset,
}: FilterElementProps) {
  const { data: filterOptionsData } = useActivityLogFilterOptions();
  const filterOptions = (
    filterOptionsData as { data?: ActivityLogFilterOptions } | undefined
  )?.data;

  const logNameOptions = [
    { value: '', name: 'all', label: 'All log names' },
    ...(filterOptions?.log_names ?? []).map((name: string) => ({
      value: name,
      name,
      label: name,
    })),
  ];

  const subjectTypeOptions = [
    { value: '', name: 'all', label: 'All entity types' },
    ...(filterOptions?.subject_types ?? []).map(
      (item: { value: string; label: string }) => ({
        value: item.label,
        name: item.label,
        label: item.label,
      })
    ),
  ];

  const causerTypeOptions = [
    { value: '', name: 'all', label: 'All actor types' },
    ...(filterOptions?.causer_types ?? []).map(
      (item: { value: string; label: string }) => ({
        value: item.value,
        name: item.value,
        label: item.label,
      })
    ),
  ];

  const activeDateShortcut =
    dateShortcutOptions.find((option) => filters[option.value] === '1')?.value ??
    '';

  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <FilterField label="Event type">
        <StatusField
          className="w-full"
          options={eventOptions}
          value={toSelectValue(filters.event)}
          onChange={(value) => updateFilter('event', toSelectValue(value))}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            eventOptions.find((option) => option.value === selected)?.label ??
            selected
          }
          placeholder="Select event"
          selectClassName="h-10 w-full min-w-0"
        />
      </FilterField>

      <FilterField label="Log name">
        <StatusField
          className="w-full"
          options={logNameOptions}
          value={toSelectValue(filters.log_name)}
          onChange={(value) => updateFilter('log_name', toSelectValue(value))}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            logNameOptions.find((option) => option.value === selected)?.label ??
            selected
          }
          placeholder="Select log name"
          selectClassName="h-10 w-full min-w-0"
        />
      </FilterField>

      <FilterField label="Entity type">
        <StatusField
          className="w-full"
          options={subjectTypeOptions}
          value={toSelectValue(filters.subject_type)}
          onChange={(value) => updateFilter('subject_type', toSelectValue(value))}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            subjectTypeOptions.find((option) => option.value === selected)
              ?.label ?? selected
          }
          placeholder="Select entity type"
          selectClassName="h-10 w-full min-w-0"
        />
      </FilterField>

      <FilterField label="Entity ID">
        <Input
          placeholder="Enter entity ID"
          className="h-10 w-full"
          value={toSelectValue(filters.subject_id)}
          onChange={(e) => updateFilter('subject_id', e.target.value)}
        />
      </FilterField>

      <FilterField label="Actor type">
        <StatusField
          className="w-full"
          options={causerTypeOptions}
          value={toSelectValue(filters.causer_type)}
          onChange={(value) => updateFilter('causer_type', toSelectValue(value))}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            causerTypeOptions.find((option) => option.value === selected)
              ?.label ?? selected
          }
          placeholder="Select actor type"
          selectClassName="h-10 w-full min-w-0"
        />
      </FilterField>

      <FilterField label="Actor name">
        <Input
          placeholder="Search by actor name"
          className="h-10 w-full"
          value={toSelectValue(filters.actor_name)}
          onChange={(e) => updateFilter('actor_name', e.target.value)}
        />
      </FilterField>

      <FilterField label="Actor email">
        <Input
          placeholder="Search by actor email"
          type="email"
          className="h-10 w-full"
          value={toSelectValue(filters.actor_email)}
          onChange={(e) => updateFilter('actor_email', e.target.value)}
        />
      </FilterField>

      <FilterField label="Created from">
        <DateFiled
          className="w-full"
          selected={
            filters.created_from
              ? new Date(String(filters.created_from))
              : null
          }
          onChange={(date: Date | null) => {
            updateFilter(
              'created_from',
              date ? formatDate(new Date(date), 'YYYY-MM-DD') : ''
            );
          }}
          placeholderText="Select start date"
          inputProps={{
            labelClassName: 'font-medium text-gray-700',
          }}
        />
      </FilterField>

      <FilterField label="Created to">
        <DateFiled
          className="w-full"
          selected={
            filters.created_to ? new Date(String(filters.created_to)) : null
          }
          onChange={(date: Date | null) => {
            updateFilter(
              'created_to',
              date ? formatDate(new Date(date), 'YYYY-MM-DD') : ''
            );
          }}
          placeholderText="Select end date"
          inputProps={{
            labelClassName: 'font-medium text-gray-700',
          }}
        />
      </FilterField>

      <FilterField label="Quick date">
        <StatusField
          className="w-full"
          options={dateShortcutOptions}
          value={activeDateShortcut}
          onChange={(value) => {
            const next = toSelectValue(value);
            dateShortcutOptions.forEach((option) => {
              if (option.value) updateFilter(option.value, '');
            });
            if (next) updateFilter(next, '1');
          }}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            dateShortcutOptions.find((option) => option.value === selected)
              ?.label ?? selected
          }
          placeholder="Select date shortcut"
          selectClassName="h-10 w-full min-w-0"
        />
      </FilterField>

      <Button
        size="sm"
        onClick={handleReset}
        variant="outline"
        className="mt-1 h-10 w-full bg-gray-100 text-gray-700"
      >
        <PiTrashDuotone className="me-1.5 h-[17px] w-[17px]" /> Clear filters
      </Button>
    </div>
  );
}
