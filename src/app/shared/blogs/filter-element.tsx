'use client';

import React from 'react';
import { PiTrashDuotone } from 'react-icons/pi';
import StatusField from '@/components/controlled-table/status-field';
import { Button } from '@/components/ui/button';
import { useMedia } from '@/hooks/use-media';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';

type FilterElementProps = {
  isFiltered: boolean;
  filters: { [key: string]: any };
  updateFilter: (columnId: string, filterValue: string | any[]) => void;
  handleReset: () => void;
};

export default function FilterElement({
  filters,
  updateFilter,
}: FilterElementProps) {
  const { t } = useTranslation('blogs');
  const isMediumScreen = useMedia('(max-width: 1860px)', false);
  const handleReset = () => {
    Object.keys(filters).forEach((filter: string) => updateFilter(filter, ''))
  }
  const statusOptions = [
    {
      value: 'active',
      name: 'active',
      label: (
        <div className="flex items-center">
          <Text className="ms-2 font-medium ">{t('blogs_filter_active')}</Text>
        </div>
      ),
    },
    {
      value: 'inactive',
      name: 'inactive',
      label: (
        <div className="flex items-center">
          <Text className="ms-2 font-medium ">{t('blogs_filter_inactive')}</Text>
        </div>
      ),
    },
  ];
  return (
    <>
            <StatusField
        options={statusOptions}
        value={filters['activation']}
        onChange={(value: string) => {
          updateFilter('activation', value);
        }}
        getOptionValue={(option) => option.value}
        displayValue={(selected: string) =>
          statusOptions.find((option) => option.value === selected)?.label ??
          selected
        }
        {...(isMediumScreen && {
          placeholder: t('blogs_filter_activation'),
          label: t('blogs_filter_activation'),
          labelClassName: 'font-medium text-gray-700',
        })}
      />

       
        <Button
          size="sm"
          onClick={handleReset}
          className="h-8 bg-gray-200/70"
          variant="flat"
        >
          <PiTrashDuotone className="me-1.5 h-[17px] w-[17px]" /> {t('blogs_filter_clear')}
        </Button>
      
    </>
  );
}
