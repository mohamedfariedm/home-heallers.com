'use client';

import { PiTrashDuotone } from 'react-icons/pi';
import DateFiled from '@/components/controlled-table/date-field';
import StatusField from '@/components/controlled-table/status-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { formatDate } from '@/utils/format-date';
import { useDoctorActivityReportFilterOptions } from '@/framework/doctor-activity-reports';
import type { DoctorActivityFilterOptions } from '@/types/doctor-activity-report';

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
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          Scopes which doctors appear and their reservation counts
        </Text>
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
