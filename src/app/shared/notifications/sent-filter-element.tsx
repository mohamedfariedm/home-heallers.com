'use client';

import { PiTrashDuotone } from 'react-icons/pi';
import DateFiled from '@/components/controlled-table/date-field';
import StatusField from '@/components/controlled-table/status-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { formatDate } from '@/utils/format-date';
import { useSentNotificationFilterOptions } from '@/framework/notifications';
import type { SentFilterOptions } from '@/types/admin-notifications';
import {
  AUDIENCE_OPTIONS,
  LANG_OPTIONS,
  SENT_SOURCE_OPTIONS,
  SENT_STATUS_OPTIONS,
} from '@/app/shared/notifications/constants';

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

export default function SentNotificationFilterElement({
  filters,
  updateFilter,
  handleReset,
}: FilterElementProps) {
  const { data: filterOptionsData } = useSentNotificationFilterOptions();
  const filterOptions = (filterOptionsData as { data?: SentFilterOptions } | undefined)
    ?.data;

  const sourceOptions =
    filterOptions?.sources?.length
      ? [
          { value: '', name: 'all', label: 'All sources' },
          ...filterOptions.sources.map((source) => ({
            value: source,
            name: source,
            label:
              SENT_SOURCE_OPTIONS.find((option) => option.value === source)?.label ??
              source,
          })),
        ]
      : [...SENT_SOURCE_OPTIONS];

  const typeOptions = [
    { value: '', name: 'all', label: 'All types' },
    ...(filterOptions?.types ?? []).map((type) => ({
      value: type,
      name: type,
      label: type,
    })),
  ];

  const creatorOptions = [
    { value: '', name: 'all', label: 'All creators' },
    ...(filterOptions?.creators ?? []).map((creator) => ({
      value: String(creator.id),
      name: String(creator.id),
      label: creator.name,
    })),
  ];

  const audienceOptions = [
    { value: '', name: 'all', label: 'All audiences' },
    ...AUDIENCE_OPTIONS.map((option) => ({
      value: option.value,
      name: option.value,
      label: option.label,
    })),
  ];

  const languageOptions = [
    { value: '', name: 'all', label: 'All languages' },
    ...LANG_OPTIONS.map((option) => ({
      value: option.value,
      name: option.value,
      label: option.label,
    })),
  ];

  return (
    <div className="grid grid-cols-1 gap-5 @lg:grid-cols-2 @4xl:grid-cols-3">
      <FilterField label="Search">
        <Input
          placeholder="Search title or body"
          value={String(filters.search ?? '')}
          onChange={(event) => updateFilter('search', event.target.value)}
        />
      </FilterField>

      <FilterField label="Source">
        <StatusField
          placeholder="Source"
          options={sourceOptions}
          value={String(filters.source ?? '')}
          onChange={(value: string) => updateFilter('source', value)}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            sourceOptions.find((option) => option.value === selected)?.label ??
            selected
          }
        />
      </FilterField>

      <FilterField label="Audience">
        <StatusField
          placeholder="Audience"
          options={audienceOptions}
          value={String(filters.recipient_type ?? '')}
          onChange={(value: string) => updateFilter('recipient_type', value)}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            audienceOptions.find((option) => option.value === selected)?.label ??
            selected
          }
        />
      </FilterField>

      <FilterField label="Status">
        <StatusField
          placeholder="Status"
          options={[...SENT_STATUS_OPTIONS]}
          value={String(filters.status ?? '')}
          onChange={(value: string) => updateFilter('status', value)}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            SENT_STATUS_OPTIONS.find((option) => option.value === selected)?.label ??
            selected
          }
        />
      </FilterField>

      <FilterField label="Language">
        <StatusField
          placeholder="Language"
          options={languageOptions}
          value={String(filters.lang ?? '')}
          onChange={(value: string) => updateFilter('lang', value)}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            languageOptions.find((option) => option.value === selected)?.label ??
            selected
          }
        />
      </FilterField>

      <FilterField label="Type">
        <StatusField
          placeholder="Type"
          options={typeOptions}
          value={String(filters.type ?? '')}
          onChange={(value: string) => updateFilter('type', value)}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            typeOptions.find((option) => option.value === selected)?.label ??
            selected
          }
        />
      </FilterField>

      <FilterField label="Created by">
        <StatusField
          placeholder="Creator"
          options={creatorOptions}
          value={String(filters.created_by ?? '')}
          onChange={(value: string) => updateFilter('created_by', value)}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            creatorOptions.find((option) => option.value === selected)?.label ??
            selected
          }
        />
      </FilterField>

      <FilterField label="Sent from">
        <DateFiled
          selected={filters.from ? new Date(String(filters.from)) : undefined}
          onChange={(date: Date | null) =>
            updateFilter('from', date ? formatDate(date, 'YYYY-MM-DD') : '')
          }
          placeholderText="From date"
        />
      </FilterField>

      <FilterField label="Sent to">
        <DateFiled
          selected={filters.to ? new Date(String(filters.to)) : undefined}
          onChange={(date: Date | null) =>
            updateFilter('to', date ? formatDate(date, 'YYYY-MM-DD') : '')
          }
          placeholderText="To date"
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
