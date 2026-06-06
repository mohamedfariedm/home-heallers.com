'use client';

import { PiTrashDuotone } from 'react-icons/pi';
import DateFiled from '@/components/controlled-table/date-field';
import StatusField from '@/components/controlled-table/status-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Switch } from '@/components/ui/switch';
import { formatDate } from '@/utils/format-date';
import { useDoctorActivityReportFilterOptions } from '@/framework/doctor-activity-reports';
import type { DoctorActivityFilterOptions } from '@/types/doctor-activity-report';

const eventOptions = [
  { value: '', name: 'all', label: 'All events' },
  { value: 'created', name: 'created', label: 'Created' },
  { value: 'updated', name: 'updated', label: 'Updated' },
  { value: 'deleted', name: 'deleted', label: 'Deleted' },
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

export default function DoctorActivityFilterElement({
  filters,
  updateFilter,
  handleReset,
}: FilterElementProps) {
  const { data: filterOptionsData } = useDoctorActivityReportFilterOptions();
  const filterOptions = (
    filterOptionsData as { data?: DoctorActivityFilterOptions } | undefined
  )?.data;

  const doctorOptions = [
    { value: '', name: 'all', label: 'All doctors' },
    ...(filterOptions?.doctors ?? []).map((doctor) => ({
      value: String(doctor.id),
      name: String(doctor.id),
      label: doctor.name,
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
        value: item.value,
        name: item.value,
        label: item.label,
      })
    ),
  ];

  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <FilterField label="Doctor">
        <StatusField
          className="w-full"
          options={doctorOptions}
          value={toSelectValue(filters.actor_id)}
          onChange={(value) => updateFilter('actor_id', toSelectValue(value))}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            doctorOptions.find((option) => option.value === selected)?.label ??
            selected
          }
          placeholder="Select doctor"
          selectClassName="h-10 w-full min-w-0"
        />
      </FilterField>

      <FilterField label="With reservation only">
        <div className="flex h-10 items-center gap-3">
          <Switch
            checked={filters.with_reservation === 'true'}
            onChange={(checked) =>
              updateFilter('with_reservation', checked ? 'true' : '')
            }
          />
          <Text className="text-sm text-gray-600">
            Only doctors with reservations in the date range
          </Text>
        </div>
      </FilterField>

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

      <FilterField label="Doctor name">
        <Input
          placeholder="Search by name"
          className="h-10 w-full"
          value={toSelectValue(filters.actor_name)}
          onChange={(e) => updateFilter('actor_name', e.target.value)}
        />
      </FilterField>

      <FilterField label="Doctor email">
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
