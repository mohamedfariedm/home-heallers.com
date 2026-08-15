'use client';

import { PiTrashDuotone } from 'react-icons/pi';
import StatusField from '@/components/controlled-table/status-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMedia } from '@/hooks/use-media';
import { Text } from '@/components/ui/text';
import { useMemo } from 'react';
import { useCategories } from '@/framework/categories';
import { useCities } from '@/framework/cities';
import { resolveLocalizedName } from '@/utils/resolve-localized-name';
import { getDashboardLocale } from '@/app/shared/offers/utils';

const statusOptions = [
  { value: '', name: 'all', label: <Text className="ms-2 font-medium">All statuses</Text> },
  { value: '1', name: 'active', label: <Text className="ms-2 font-medium">Active</Text> },
  { value: '0', name: 'inactive', label: <Text className="ms-2 font-medium">Inactive</Text> },
];

const sortOptions = [
  { value: '', name: 'default', label: <Text className="ms-2 font-medium">Default order</Text> },
  { value: 'featured', name: 'featured', label: <Text className="ms-2 font-medium">Featured</Text> },
  { value: 'best_seller', name: 'best_seller', label: <Text className="ms-2 font-medium">Best seller</Text> },
  { value: 'highest_discount', name: 'highest_discount', label: <Text className="ms-2 font-medium">Highest discount</Text> },
  { value: 'newest', name: 'newest', label: <Text className="ms-2 font-medium">Newest</Text> },
  { value: 'price_asc', name: 'price_asc', label: <Text className="ms-2 font-medium">Price: low to high</Text> },
  { value: 'price_desc', name: 'price_desc', label: <Text className="ms-2 font-medium">Price: high to low</Text> },
];

const flagOptions = [
  { key: 'is_featured', label: 'Featured' },
  { key: 'is_best_seller', label: 'Best seller' },
  { key: 'is_most_popular', label: 'Popular' },
  { key: 'is_new', label: 'New' },
];

type FilterElementProps = {
  isFiltered: boolean;
  filters: { [key: string]: any };
  updateFilter: (columnId: string, filterValue: string | any[]) => void;
  handleReset: () => void;
};

export default function FilterElement({
  filters,
  updateFilter,
  handleReset,
}: FilterElementProps) {
  const isMediumScreen = useMedia('(max-width: 1860px)', false);
  const locale = getDashboardLocale();
  const { data: categories } = useCategories('limit=200');
  const { data: cities } = useCities('limit=200');

  const categoryOptions = useMemo(
    () => [
      { value: '', name: 'all', label: <Text className="ms-2 font-medium">All categories</Text> },
      ...((categories?.data ?? []).map((item: any) => ({
        value: String(item.id),
        name: String(item.id),
        label: (
          <Text className="ms-2 font-medium">
            {resolveLocalizedName(item?.name, locale) || `Category ${item.id}`}
          </Text>
        ),
      })) || []),
    ],
    [categories?.data, locale]
  );

  const cityOptions = useMemo(
    () => [
      { value: '', name: 'all', label: <Text className="ms-2 font-medium">All cities</Text> },
      ...((cities?.data ?? []).map((item: any) => ({
        value: String(item.id),
        name: String(item.id),
        label: (
          <Text className="ms-2 font-medium">
            {resolveLocalizedName(item?.name, locale) || `City ${item.id}`}
          </Text>
        ),
      })) || []),
    ],
    [cities?.data, locale]
  );

  const priceError =
    filters.price_min &&
    filters.price_max &&
    Number(filters.price_min) > Number(filters.price_max);

  return (
    <>
      <StatusField
        options={statusOptions}
        value={filters.is_active ?? ''}
        onChange={(value: string) => updateFilter('is_active', value)}
        getOptionValue={(option) => option.value}
        displayValue={(selected: string) =>
          statusOptions.find((option) => option.value === selected)?.label ?? selected
        }
        {...(isMediumScreen && {
          placeholder: 'Status',
          label: 'Status',
          labelClassName: 'font-medium text-gray-700',
        })}
      />
      <StatusField
        options={categoryOptions}
        value={filters.category_id ?? ''}
        onChange={(value: string) => updateFilter('category_id', value)}
        getOptionValue={(option) => option.value}
        displayValue={(selected: string) =>
          categoryOptions.find((option) => option.value === selected)?.label ?? selected
        }
        {...(isMediumScreen && {
          placeholder: 'Category',
          label: 'Category',
          labelClassName: 'font-medium text-gray-700',
        })}
      />
      <StatusField
        options={cityOptions}
        value={filters.city_id ?? ''}
        onChange={(value: string) => updateFilter('city_id', value)}
        getOptionValue={(option) => option.value}
        displayValue={(selected: string) =>
          cityOptions.find((option) => option.value === selected)?.label ?? selected
        }
        {...(isMediumScreen && {
          placeholder: 'City',
          label: 'City',
          labelClassName: 'font-medium text-gray-700',
        })}
      />
      <StatusField
        options={sortOptions}
        value={filters.sort ?? ''}
        onChange={(value: string) => updateFilter('sort', value)}
        getOptionValue={(option) => option.value}
        displayValue={(selected: string) =>
          sortOptions.find((option) => option.value === selected)?.label ?? selected
        }
        {...(isMediumScreen && {
          placeholder: 'Sort',
          label: 'Sort',
          labelClassName: 'font-medium text-gray-700',
        })}
      />
      <Input
        type="number"
        placeholder="Min price"
        value={filters.price_min || ''}
        onChange={(e) => updateFilter('price_min', e.target.value)}
        className="w-28"
      />
      <Input
        type="number"
        placeholder="Max price"
        value={filters.price_max || ''}
        onChange={(e) => updateFilter('price_max', e.target.value)}
        className="w-28"
      />
      {priceError && (
        <Text className="text-xs text-red-500">Min price must be ≤ max price</Text>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {flagOptions.map((flag) => (
          <Button
            key={flag.key}
            size="sm"
            variant={filters[flag.key] === '1' ? 'solid' : 'outline'}
            onClick={() =>
              updateFilter(flag.key, filters[flag.key] === '1' ? '' : '1')
            }
            className="h-8"
          >
            {flag.label}
          </Button>
        ))}
      </div>
      <Button
        size="sm"
        onClick={handleReset}
        className="h-8 bg-gray-200/70"
        variant="flat"
      >
        <PiTrashDuotone className="me-1.5 h-[17px] w-[17px]" /> Reset
      </Button>
    </>
  );
}
