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
  roleDetails: {name: string, value: string}[] | [];
};

export default function FilterElement({
  isFiltered,
  filters,
  updateFilter,
  roleDetails,
//   brandFilter,
}: FilterElementProps) {
  const isMediumScreen = useMedia('(max-width: 1860px)', false);
  // const [selectedRegion, setSelectedRegion] = useState<{name: string, value: string}[]>([])
  // const [selectedRetailer, setSelectedRetailer] = useState<{name: string, value: string}[] | []>([])
  const handleReset = () => {
    Object.keys(filters).forEach((filter: string) => updateFilter(filter, ''))
  }
  return (
    <>

       {/* <div className='flex gap-2'>  */}

        <StatusField
          options={roleDetails}
          placeholder='Select Role'
          value={filters['role']}
          onChange={(value: string) => {
            updateFilter('role', value);
          }}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
              roleDetails?.find((option) => option.value === selected)?.name ??
            selected
          }
          {...(isMediumScreen && {
            label: 'Roles',
            labelClassName: 'font-medium text-gray-700',
          })}
        />
      {/* </div>  */}



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
