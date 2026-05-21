'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '@/framework/utils';
import ColumnFilterPopover from '@/app/shared/customer-suport/column-filter-popover';
import { resolveLocalizedName } from '@/utils/resolve-localized-name';

export type LookupFilterColumnKey =
  | 'nationality_name'
  | 'country_name'
  | 'city_name';

function mapNameOptions(items: any[] | undefined): { label: string; value: string }[] {
  if (!items?.length) return [];
  const seen = new Set<string>();
  const options: { label: string; value: string }[] = [];

  for (const item of items) {
    const en = resolveLocalizedName(item?.name, 'en');
    const ar = resolveLocalizedName(item?.name, 'ar');
    const label = en || ar;
    const value = en || ar;
    if (!value || seen.has(value)) continue;
    seen.add(value);
    options.push({
      label: ar && en && ar !== en ? `${en} / ${ar}` : label,
      value,
    });
  }

  return options.sort((a, b) => a.label.localeCompare(b.label));
}

function useLookupFilterOptions(columnKey: LookupFilterColumnKey) {
  return useQuery({
    queryKey: ['lookup-filter-options', columnKey],
    queryFn: async () => {
      const param = 'limit=500';
      if (columnKey === 'nationality_name') {
        const res = await client.nationalities.all(param);
        return res?.data ?? [];
      }
      if (columnKey === 'country_name') {
        const res = await client.countries.all(param);
        return res?.data ?? [];
      }
      const res = await client.cities.all(param);
      return res?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

type LookupColumnFilterPopoverProps = {
  columnKey: LookupFilterColumnKey;
  onFilterChange: (key: string, value: any) => void;
  initialValue?: {
    c1?: { op: string; value: string };
    c2?: { op: string; value: string };
    logic?: 'and' | 'or';
  };
};

export default function LookupColumnFilterPopover({
  columnKey,
  onFilterChange,
  initialValue,
}: LookupColumnFilterPopoverProps) {
  const { data, isLoading } = useLookupFilterOptions(columnKey);
  const selectOptions = useMemo(() => mapNameOptions(data), [data]);

  return (
    <ColumnFilterPopover
      columnKey={columnKey}
      onFilterChange={onFilterChange}
      initialValue={initialValue}
      offerOptions={selectOptions}
      offerOptionsLoading={isLoading}
    />
  );
}
