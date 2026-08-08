'use client';

import { PiTrashDuotone } from 'react-icons/pi';
import StatusField from '@/components/controlled-table/status-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

type FilterElementProps = {
  filters: Record<string, unknown>;
  updateFilter: (columnId: string, filterValue: string | unknown[]) => void;
  handleReset: () => void;
};

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

const STATUS_OPTIONS = [
  { value: '', name: 'all', label: 'All statuses' },
  { value: 'draft', name: 'draft', label: 'Draft' },
  { value: 'sent', name: 'sent', label: 'Sent' },
];

const FEEDBACK_OPTIONS = [
  { value: '', name: 'all', label: 'All' },
  { value: '1', name: 'yes', label: 'Has feedback' },
  { value: '0', name: 'no', label: 'No feedback' },
];

export default function ExerciseProgramFilterElement({
  filters,
  updateFilter,
  handleReset,
}: FilterElementProps) {
  return (
    <div className="grid grid-cols-1 gap-5 @lg:grid-cols-2 @4xl:grid-cols-3">
      <FilterField label="Search">
        <Input
          placeholder="Search title"
          value={String(filters.search ?? '')}
          onChange={(event) => updateFilter('search', event.target.value)}
        />
      </FilterField>

      <FilterField label="Doctor ID">
        <Input
          placeholder="Doctor ID"
          value={String(filters.doctor_id ?? '')}
          onChange={(event) => updateFilter('doctor_id', event.target.value)}
        />
      </FilterField>

      <FilterField label="Patient ID">
        <Input
          placeholder="Patient ID"
          value={String(filters.client_id ?? '')}
          onChange={(event) => updateFilter('client_id', event.target.value)}
        />
      </FilterField>

      <FilterField label="Status">
        <StatusField
          placeholder="Status"
          options={STATUS_OPTIONS}
          value={String(filters.status ?? '')}
          onChange={(value: string) => updateFilter('status', value)}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            STATUS_OPTIONS.find((option) => option.value === selected)?.label ??
            selected
          }
        />
      </FilterField>

      <FilterField label="Feedback">
        <StatusField
          placeholder="Feedback"
          options={FEEDBACK_OPTIONS}
          value={String(filters.has_feedback ?? '')}
          onChange={(value: string) => updateFilter('has_feedback', value)}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            FEEDBACK_OPTIONS.find((option) => option.value === selected)
              ?.label ?? selected
          }
        />
      </FilterField>

      <div className="col-span-full flex justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={handleReset}
          className="gap-2"
        >
          <PiTrashDuotone className="h-4 w-4" />
          Clear filters
        </Button>
      </div>
    </div>
  );
}
