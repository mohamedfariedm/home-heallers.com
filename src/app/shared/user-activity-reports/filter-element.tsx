'use client';

import { PiTrashDuotone } from 'react-icons/pi';
import DateFiled from '@/components/controlled-table/date-field';
import StatusField from '@/components/controlled-table/status-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Switch } from '@/components/ui/switch';
import { formatDate } from '@/utils/format-date';
import { useUserActivityReportFilterOptions } from '@/framework/user-activity-reports';
import type { UserActivityFilterOptions } from '@/types/user-activity-report';

const eventOptions = [
  { value: '', name: 'all', label: 'All events' },
  { value: 'created', name: 'created', label: 'Created' },
  { value: 'updated', name: 'updated', label: 'Updated' },
  { value: 'deleted', name: 'deleted', label: 'Deleted' },
];

const customerSupportTypeOptions = [
  { value: '', name: 'all', label: 'All lead activity' },
  { value: 'operation', name: 'operation', label: 'Inbound (operation leads)' },
  { value: 'marketing', name: 'marketing', label: 'Outbound (marketing leads)' },
];

const BOOLEAN_FILTERS = [
  'only_created',
  'only_updated',
  'only_deleted',
  'only_login_related',
  'only_request_related',
] as const;

type FilterElementProps = {
  filters: Record<string, unknown>;
  updateFilter: (columnId: string, filterValue: string | unknown[]) => void;
  handleReset: () => void;
};

function toSelectValue(value: unknown): string {
  if (value == null) return '';
  return String(value);
}

function isTruthy(value: unknown): boolean {
  return value === 'true' || value === '1' || value === true;
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

export default function UserActivityFilterElement({
  filters,
  updateFilter,
  handleReset,
}: FilterElementProps) {
  const { data: filterOptionsData } = useUserActivityReportFilterOptions();
  const filterOptions = (
    filterOptionsData as { data?: UserActivityFilterOptions } | undefined
  )?.data;

  const userOptions = [
    { value: '', name: 'all', label: 'All users' },
    ...(filterOptions?.users ?? []).map((user) => ({
      value: String(user.id),
      name: String(user.id),
      label: user.name,
    })),
  ];

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

  const setBooleanFilter = (key: (typeof BOOLEAN_FILTERS)[number], checked: boolean) => {
    if (checked) {
      BOOLEAN_FILTERS.forEach((name) => {
        if (name !== key) updateFilter(name, '');
      });
      updateFilter(key, 'true');
      if (key === 'only_created') updateFilter('event', 'created');
      if (key === 'only_updated') updateFilter('event', 'updated');
      if (key === 'only_deleted') updateFilter('event', 'deleted');
      return;
    }
    updateFilter(key, '');
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <FilterField label="Staff user">
        <StatusField
          className="w-full"
          options={userOptions}
          value={toSelectValue(filters.actor_id)}
          onChange={(value) => updateFilter('actor_id', toSelectValue(value))}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            userOptions.find((option) => option.value === selected)?.label ??
            selected
          }
          placeholder="Select user"
          selectClassName="h-10 w-full min-w-0"
        />
      </FilterField>

      <FilterField label="Event type">
        <StatusField
          className="w-full"
          options={eventOptions}
          value={toSelectValue(filters.event)}
          onChange={(value) => {
            BOOLEAN_FILTERS.slice(0, 3).forEach((name) => updateFilter(name, ''));
            updateFilter('event', toSelectValue(value));
          }}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            eventOptions.find((option) => option.value === selected)?.label ??
            selected
          }
          placeholder="Select event"
          selectClassName="h-10 w-full min-w-0"
        />
      </FilterField>

      <FilterField label="Quick filters">
        <div className="space-y-3 rounded-md border border-gray-200 p-3 dark:border-gray-700">
          {(
            [
              ['only_created', 'Created only'],
              ['only_updated', 'Updated only'],
              ['only_deleted', 'Deleted only'],
              ['only_login_related', 'Login / authentication only'],
              ['only_request_related', 'Import / bulk operations only'],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <Text className="text-sm text-gray-600">{label}</Text>
              <Switch
                checked={isTruthy(filters[key])}
                onChange={(checked) => setBooleanFilter(key, checked)}
              />
            </div>
          ))}
        </div>
      </FilterField>

      <FilterField label="Lead activity type">
        <StatusField
          className="w-full"
          options={customerSupportTypeOptions}
          value={toSelectValue(filters.customer_support_type)}
          onChange={(value) => {
            updateFilter('customer_support_type', toSelectValue(value));
            if (toSelectValue(value)) updateFilter('log_name', '');
          }}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            customerSupportTypeOptions.find((option) => option.value === selected)
              ?.label ?? selected
          }
          placeholder="Select lead type"
          selectClassName="h-10 w-full min-w-0"
        />
      </FilterField>

      <FilterField label="Log name">
        <StatusField
          className="w-full"
          options={logNameOptions}
          value={toSelectValue(filters.log_name)}
          onChange={(value) => {
            updateFilter('log_name', toSelectValue(value));
            if (toSelectValue(value)) updateFilter('customer_support_type', '');
          }}
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

      <FilterField label="Actor name">
        <Input
          placeholder="Search by name"
          className="h-10 w-full"
          value={toSelectValue(filters.actor_name)}
          onChange={(e) => updateFilter('actor_name', e.target.value)}
        />
      </FilterField>

      <FilterField label="Actor email">
        <Input
          placeholder="Search by email"
          type="email"
          className="h-10 w-full"
          value={toSelectValue(filters.actor_email)}
          onChange={(e) => updateFilter('actor_email', e.target.value)}
        />
      </FilterField>

      <FilterField label="Date from">
        <DateFiled
          className="w-full"
          selected={
            filters.date_from ? new Date(String(filters.date_from)) : null
          }
          onChange={(date: Date | null) => {
            updateFilter(
              'date_from',
              date ? formatDate(new Date(date), 'YYYY-MM-DD') : ''
            );
          }}
          placeholderText="Select start date"
          inputProps={{ labelClassName: 'font-medium text-gray-700' }}
        />
      </FilterField>

      <FilterField label="Date to">
        <DateFiled
          className="w-full"
          selected={filters.date_to ? new Date(String(filters.date_to)) : null}
          onChange={(date: Date | null) => {
            updateFilter(
              'date_to',
              date ? formatDate(new Date(date), 'YYYY-MM-DD') : ''
            );
          }}
          placeholderText="Select end date"
          inputProps={{ labelClassName: 'font-medium text-gray-700' }}
        />
      </FilterField>

      <FilterField label="Time from">
        <Input
          type="time"
          className="h-10 w-full"
          value={toSelectValue(filters.time_from || filters.time)}
          onChange={(e) => updateFilter('time_from', e.target.value)}
        />
      </FilterField>

      <FilterField label="Time to">
        <Input
          type="time"
          className="h-10 w-full"
          value={toSelectValue(filters.time_to)}
          onChange={(e) => updateFilter('time_to', e.target.value)}
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
