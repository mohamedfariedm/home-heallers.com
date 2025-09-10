'use client';

import React, { useEffect, useState } from 'react';
import { PiTrashDuotone } from 'react-icons/pi';
import DateFiled from '@/components/controlled-table/date-field';
import StatusField from '@/components/controlled-table/status-field';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/format-date';
import { useMedia } from '@/hooks/use-media';
import { Text } from '@/components/ui/text';

const statusOptions = [
  {
    value: 'active',
    name: 'active',
    label: (
      <div className="flex items-center">
        <Text className="ms-2 font-medium ">ACTIVE</Text>
      </div>
    ),
  },
  {
    value: 'inactive',
    name: 'inactive',
    label: (
      <div className="flex items-center">
        <Text className="ms-2 font-medium ">IN ACTIVE</Text>
      </div>
    ),
  },
];


type FilterElementProps = {
  isFiltered: boolean;
  filters: { [key: string]: any };
  updateFilter: (columnId: string, filterValue: string | any[]) => void;
  retailerDetails: {name: string, value: string, stores: {name: string, id: number}[]}[] | [];
  regionDetails: {name: string, value: string, city: any}[] | [];
  typeDetails: {name: string, value: string}[] | [];
};

export default function FilterElement({
  isFiltered,
  filters,
  updateFilter,
  retailerDetails,
  regionDetails,
  typeDetails,
  // storeDetails,

//   brandFilter,
}: FilterElementProps) {
  const isMediumScreen = useMedia('(max-width: 1860px)', false);
  const [selectedRegion, setSelectedRegion] = useState<{name: string, value: string}[]>([])
  const [selectedRetailer, setSelectedRetailer] = useState<{name: string, value: string}[] | []>([])
  useEffect(() => {
    if(filters['region_id']){
        setSelectedRegion(regionDetails?.find((regions: any) => regions?.value == filters['region_id'])?.city?.map((city: any) => ({
          name: city?.name,
          value: String(city?.id)
        })) || [])
      }
      if(filters['retailer_id']){
        setSelectedRetailer(retailerDetails?.find((retailer: any) => retailer?.value == filters['retailer_id'])?.stores?.map((store: any) => ({name: store?.name, value: String(store?.id)})) || [])
      }
  }, [])
  const handleReset = () => {
    Object.keys(filters).forEach((filter: string) => updateFilter(filter, ''))
  }
  return (
    <>
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
       <div className='flex gap-2'> 

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
          label: 'Activation',
          placeholder:"Activaton",
          labelClassName: 'font-medium text-gray-700',
        })}
      />
        <StatusField
          options={typeDetails}
          placeholder='Select type'
          value={filters['type']}
          onChange={(value: string) => {
            updateFilter('type', value);
          }}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            typeDetails?.find((option) => option.value === selected)?.name ??
            selected
          }
          {...(isMediumScreen && {
            label: 'Type',
            labelClassName: 'font-medium text-gray-700',
          })}
        />
      </div> 
      {/* <div className='flex gap-2'>

         <StatusField
          options={storeDetails}
          placeholder='Select Store'
          value={filters['store_id']}
          onChange={(value: string) => {
            updateFilter('store_id', value);
          }}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
                storeDetails?.find((option) => option.value === selected)?.name ??
            selected
          }
          {...(isMediumScreen && {
            label: 'stores',
            labelClassName: 'font-medium text-gray-700',
          })}
        /> 
      </div> */}

      <div className='flex gap-2'>
        <StatusField
            options={regionDetails}
            placeholder='Select region'
            value={filters['region_id']}
            onChange={(value: string) => {
            updateFilter('region_id', value);
            setSelectedRegion(regionDetails?.find((regions: any) => regions?.value == value)?.city?.map((city: any) => ({
                name: city?.name,
                value: String(city?.id)
            })) || [])
            }}
            getOptionValue={(option) => option.value}
            displayValue={(selected: string) =>
            regionDetails?.find((option) => option.value === selected)?.name ??
            selected
            }
            {...(isMediumScreen && {
            label: 'Regions',
            labelClassName: 'font-medium text-gray-700',
            })}
        />

        <StatusField
            options={selectedRegion}
            placeholder='Select city'
            value={filters['city_id']}
            onChange={(value: string) => {
            updateFilter('city_id', value);
            }}
            getOptionValue={(option) => option.value}
            displayValue={(selected: string) =>
            selectedRegion?.find((option) => option.value === selected)?.name ??
            selected
            }
            {...(isMediumScreen && {
            label: 'Cities',
            labelClassName: 'font-medium text-gray-700',
            })}
        />
      </div>


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
