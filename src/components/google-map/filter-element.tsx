'use client';

import React, { useEffect, useState } from 'react';
import { PiTrashDuotone } from 'react-icons/pi';
import StatusField from '@/components/controlled-table/status-field';
import { Button } from '@/components/ui/button';
import { useMedia } from '@/hooks/use-media';

type FilterElementProps = {
  isFiltered: boolean;
  filters: { [key: string]: any };
  updateFilter: (columnId: string, filterValue: string | any[]) => void;
  roleDetails: {name: string, value: string}[] | [];
  regionDetails: {name: string, value: string, city: any}[] | [];
  retailerDetails: {name: string, value: string, stores: {name: string, id: number}[]}[] | [];
};

export default function FilterElement({
  filters,
  updateFilter,
  roleDetails,
  regionDetails,
  retailerDetails,
}: FilterElementProps) {
  const isMediumScreen = useMedia('(max-width: 1860px)', false);
  const [selectedRegion, setSelectedRegion] = useState<{name: string, value: string}[]>([])
  const [selectedRetailer, setSelectedRetailer] = useState<{name: string, value: string}[] | []>([])
  useEffect(() => {
    if(filters['region_filter']){
      setSelectedRegion(regionDetails?.find((regions: any) => regions?.value == filters['region_filter'])?.city?.map((city: any) => ({
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
          options={roleDetails}
          placeholder='Select role'
          value={filters['role_filter']}
          onChange={(value: string) => {
            updateFilter('role_filter', value);
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
      
        <div className='flex gap-2'>
        <StatusField
              options={retailerDetails}
              placeholder='Select retailer'
              value={filters['retailer_filter']}
              onChange={(value: string) => {
                updateFilter('retailer_filter', value);
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
              value={filters['store_filter']}
              onChange={(value: string) => {
                updateFilter('store_filter', value);
              }}
              getOptionValue={(option) => option.value}
              displayValue={(selected: string) =>
                selectedRetailer?.find((option) => option.value === selected)?.name ??
                ''
              }
              {...(isMediumScreen && {
                label: 'Stores',
                labelClassName: 'font-medium text-gray-700',
              })}
            />
        </div>
        
     
      <div className='flex gap-2'>
        <StatusField
            options={regionDetails}
            placeholder='Select region'
            value={filters['city_filter']}
            onChange={(value: string) => {
            updateFilter('city_filter', value);
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
            value={filters['city_filter']}
            onChange={(value: string) => {
            updateFilter('city_filter', value);
            }}
            getOptionValue={(option) => option.value}
            displayValue={(selected: string) =>
            selectedRegion?.find((option) => option.value === selected)?.name ??
            ''
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
