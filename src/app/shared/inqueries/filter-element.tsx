'use client';

import React, { useEffect, useState } from 'react';
import { PiTrashDuotone } from 'react-icons/pi';
import DateFiled from '@/components/controlled-table/date-field';
import StatusField from '@/components/controlled-table/status-field';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/format-date';
import { useMedia } from '@/hooks/use-media';
import { Text } from '@/components/ui/text';


type FilterElementProps = {
  isFiltered: boolean;
  filters: { [key: string]: any };
  updateFilter: (columnId: string, filterValue: string | any[]) => void;
  userDetails: {name: string, value: string}[] | [];
};

const statusOptions = [
  {
    value: 'seen',
    name: 'seen',
    label: (
      <div className="flex items-center">
        <Text className="ms-2 font-medium ">Read</Text>
      </div>
    ),
  },
  {
    value: 'inseen',
    name: 'inseen',
    label: (
      <div className="flex items-center">
        <Text className="ms-2 font-medium ">Unread</Text>
      </div>
    ),
  },

];

export default function FilterElement({
  isFiltered,
  filters,
  updateFilter,
  userDetails,

//   brandFilter,
}: FilterElementProps) {
  const isMediumScreen = useMedia('(max-width: 1860px)', false);

  const handleReset = () => {
    Object.keys(filters).forEach((filter: string) => updateFilter(filter, ''))
  }
  return (
    <>
      <div className='flex gap-2 '>
        <DateFiled
            selected={filters['date_from'] ? new Date(filters['date_from']) : null}
            onChange={(date: any) => {
            updateFilter('date_from', formatDate(date, 'YYYY-MM-DD'));
            }}
            placeholderText="Select installation date from"
            {...(isMediumScreen && {
            inputProps: {
                label: 'Date From',
                labelClassName: 'font-medium text-gray-700',
            },
            })}
        />
        <DateFiled
            selected={filters['date_to'] ? new Date(filters['date_to']) : null}
            onChange={(date: any) => {
            updateFilter('date_to', formatDate(new Date(date), 'YYYY-MM-DD'));
            }}
            placeholderText="Select date to"
            {...(isMediumScreen && {
            inputProps: {
                label: 'Date to',
                labelClassName: 'font-medium text-gray-700',
            },
            })}
        />
      </div>

        <StatusField
          options={userDetails}
          placeholder='Select user'
          value={filters['user_id']}
          onChange={(value: string) => {
            updateFilter('user_id', value);
          }}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
              userDetails?.find((option) => option.value === selected)?.name ??
            selected
          }
          {...(isMediumScreen && {
            label: 'Users',
            labelClassName: 'font-medium text-gray-700',
          })}
        />
                    <StatusField
        options={statusOptions}
        value={filters['seen']}
        onChange={(value: string) => {
          updateFilter('seen', value);
        }}
        getOptionValue={(option) => option.value}
        displayValue={(selected: string) =>
          statusOptions.find((option) => option.value === selected)?.label ??
          selected
        }
        {...(isMediumScreen && {
          placeholder:"Read",
          label: 'State',
          labelClassName: 'font-medium text-gray-700',
        })}
      />

        

      {/* {isFiltered ? ( */}
        <Button
          size="sm"
          onClick={handleReset}
          className="h-8 bg-gray-200/70"
          variant="flat"
        >
          <PiTrashDuotone className="me-1.5 h-[17px] w-[17px]" /> Clear
        </Button>
      {/* ) : null} */}
    </>
  );
}
