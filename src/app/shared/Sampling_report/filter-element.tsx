'use client';

import React, { useState } from 'react';
import { PiTrashDuotone } from 'react-icons/pi';
import DateFiled from '@/components/controlled-table/date-field';
import StatusField from '@/components/controlled-table/status-field';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/format-date';
import { useMedia } from '@/hooks/use-media';


type FilterElementProps = {
  isFiltered: boolean;
  filters: { [key: string]: any };
  updateFilter: (columnId: string, filterValue: string | any[]) => void;
  userDetails: {name: string, value: string}[] | [];
  retailerDetails: {name: string, value: string, stores: {name: string, id: number}[]}[] | [];
  regionDetails: {name: string, value: string, city: any}[] | [];
  brandDetails: {name: string, value: string}[] | [];
  storeDetails: {name: string, value: string}[] | [];
//   brandFilter: {name: string, value: string}[] | [];
};

export default function FilterElement({
  isFiltered,
  filters,
  updateFilter,
  userDetails,
  retailerDetails,
  regionDetails,
  storeDetails,
  brandDetails,
//   brandFilter,
}: FilterElementProps) {
  const isMediumScreen = useMedia('(max-width: 1860px)', false);
  const [selectedRegion, setSelectedRegion] = useState<{name: string, value: string}[]>([])
  const [selectedRetailer, setSelectedRetailer] = useState<{name: string, value: string}[] | []>([])
  const handleReset = () => {
    Object.keys(filters).forEach((filter: string) => updateFilter(filter, ''))
  }
  return (
    <>
      <div className='flex gap-2'>
        <DateFiled
            selected={filters['sampling_date_from'] ? new Date(filters['sampling_date_from']) : null}
            onChange={(date: any) => {
            updateFilter('sampling_date_from', formatDate(date, 'YYYY-MM-DD'));
            }}
            placeholderText="Select Sampling Date From"
            {...(isMediumScreen && {
            inputProps: {
                label: 'Sampling Date From',
                labelClassName: 'font-medium text-gray-700',
            },
            })}
        />
        <DateFiled
            selected={filters['sampling_date_to'] ? new Date(filters['sampling_date_to']) : null}
            onChange={(date: any) => {
            updateFilter('sampling_date_to', formatDate(new Date(date), 'YYYY-MM-DD'));
            }}
            placeholderText="Select Sampling date to"
            {...(isMediumScreen && {
            inputProps: {
                label: 'Sampling Date To',
                labelClassName: 'font-medium text-gray-700',
            },
            })}
        />
      </div>
      <div className='flex gap-2'>
        <DateFiled
            selected={filters['in_store_promotion_date_from'] ? new Date(filters['in_store_promotion_date_from']) : null}
            onChange={(date: any) => {
            updateFilter('in_store_promotion_date_from', formatDate(date, 'YYYY-MM-DD'));
            }}
            placeholderText="Select Instore date from"
            {...(isMediumScreen && {
            inputProps: {
                label: 'Instore Date From',
                labelClassName: 'font-medium text-gray-700',
            },
            })}
        />
        <DateFiled
            selected={filters['in_store_promotion_date_to'] ? new Date(filters['in_store_promotion_date_to']) : null}
            onChange={(date: any) => {
            updateFilter('in_store_promotion_date_to', formatDate(new Date(date), 'YYYY-MM-DD'));
            }}
            placeholderText="Select Instore date to"
            {...(isMediumScreen && {
            inputProps: {
                label: 'Instore Date to',
                labelClassName: 'font-medium text-gray-700',
            },
            })}
        />
      </div>
      <div className='flex gap-2'>
          <StatusField
            options={brandDetails}
            placeholder='Select brand'
            value={filters['filter_brand']}
            onChange={(value: string) => {
            updateFilter('filter_brand', value);
            }}
            getOptionValue={(option) => option.value}
            displayValue={(selected: string) =>
                brandDetails?.find((option) => option.value === selected)?.name ??
            selected
            }
            {...(isMediumScreen && {
            label: 'Brands',
            labelClassName: 'font-medium text-gray-700',
            })} 
          />
        <StatusField
          options={userDetails}
          placeholder='Select User'
          value={filters['filter_user']}
          onChange={(value: string) => {
            updateFilter('filter_user', value);
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

        </div>
      <div className='flex gap-2'>
            <StatusField
              options={retailerDetails}
              placeholder='Select retailer'
              value={filters['filter_retailer']}
              onChange={(value: string) => {
                updateFilter('filter_retailer', value);
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
              value={filters['filter_store']}
              onChange={(value: string) => {
                updateFilter('filter_store', value);
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
            value={filters['filter_region']}
            onChange={(value: string) => {
            updateFilter('filter_region', value);
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
            value={filters['filter_city']}
            onChange={(value: string) => {
            updateFilter('filter_city', value);
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
