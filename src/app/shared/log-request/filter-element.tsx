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
  retailerDetails: {name: string, value: string, stores: {name: string, id: number}[]}[] | [];
};
const statusOptions = [
  {
    value: 'out_of_location',
    name: 'out_of_location',
    label: (
      <div className="flex items-center">
        <Text className="ms-2 font-medium ">Out Of location</Text>
      </div>
    ),
  },
  {
    value: 'fack_location',
    name: 'fack_location',
    label: (
      <div className="flex items-center">
        <Text className="ms-2 font-medium ">Fack Location</Text>
      </div>
    ),
  },
  {
    value: 'wrong_mac_id',
    name: 'wrong_mac_id',
    label: (
      <div className="flex items-center">
        <Text className="ms-2 font-medium ">Wrong MAC ID</Text>
      </div>
    ),
  },
];

export default function FilterElement({
  isFiltered,
  filters,
  updateFilter,
  userDetails,
  retailerDetails,
}: FilterElementProps) {
  const isMediumScreen = useMedia('(max-width: 1860px)', false);
  const [selectedRegion, setSelectedRegion] = useState<{name: string, value: string}[]>([])
  const [selectedRetailer, setSelectedRetailer] = useState<{name: string, value: string}[] | []>([])
  useEffect(() => {
    if(filters['retailer_id']){
      setSelectedRetailer(retailerDetails?.find((retailer: any) => retailer?.value == filters['retailer_id'])?.stores?.map((store: any) => ({name: store?.name, value: String(store?.id)})) || [])
    }
  }, [])
  const handleReset = () => {
    Object.keys(filters).forEach((filter: string) => updateFilter(filter, ''))
  }
  return (
    <>
      <div className='flex gap-2'>
        <DateFiled
            selected={filters['date_from'] ? new Date(filters['date_from']) : null}
            onChange={(date: any) => {
            updateFilter('date_from', formatDate(new Date(date), 'YYYY-MM-DD'));
            }}
            placeholderText=" Log Date From"
            {...(isMediumScreen && {
            inputProps: {
                label: ' Log Date From',
                labelClassName: 'font-medium text-gray-700',
            },
            })}
        />
        <DateFiled
            selected={filters['date_to'] ? new Date(filters['date_to']) : null}
            onChange={(date: any) => {
            updateFilter('date_to', formatDate(new Date(date), 'YYYY-MM-DD'));
            }}
            placeholderText="Log Date To"
            {...(isMediumScreen && {
            inputProps: {
                label: 'Log Date To',
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


      
        <div className='flex gap-2'>
            <StatusField
              options={retailerDetails}
              placeholder='Select retailer'
              value={filters['retailer_id']}
              onChange={(value: string) => {
                updateFilter('retailer_id', value);
                setSelectedRetailer(retailerDetails?.find((retailer: any) => retailer?.value == value)?.stores?.map((store: any) => ({name: store?.name, value: String(store?.id)})) || [])
          }}
              getOptionValue={(option) => option.value}
              displayValue={(selected: string) =>
                  retailerDetails?.find((option) => option.value === selected)?.name ??
                selected
              }
              {...(isMediumScreen && {
                label: 'Retailers',
                labelClassName: 'font-medium text-gray-700',
              })} 
            />
            <StatusField
              options={selectedRetailer}
              placeholder='Select store'
              value={filters['store_id']}
              onChange={(value: string) => {
                updateFilter('store_id', value);
              }}
              getOptionValue={(option) => option.value}
              displayValue={(selected: string) =>
                selectedRetailer?.find((option) => option.value === selected)?.name ??
                selected
              }
              {...(isMediumScreen && {
                label: 'Stores',
                labelClassName: 'font-medium text-gray-700',
              })}
            />
            
        </div>
      <StatusField
        options={statusOptions}
        value={filters['type']}
        onChange={(value: string) => {
          updateFilter('type', value);
        }}
        getOptionValue={(option) => option.value}
        displayValue={(selected: string) =>
          statusOptions.find((option) => option.value === selected)?.label ??
          selected
        }
        {...(isMediumScreen && {
          label: 'Type',
          placeholder:"Type",
          labelClassName: 'font-medium text-gray-700',
        })}
      />

        <Button
          size="sm"
          onClick={handleReset}
          className="h-8 bg-gray-200/70"
          variant="flat"
        >
          <PiTrashDuotone className="me-1.5 h-[17px] w-[17px]" /> Clear
        </Button>
    </>
  );
}
